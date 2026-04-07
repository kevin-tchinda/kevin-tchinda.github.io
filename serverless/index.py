# -*- coding: utf-8 -*-
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chromadb
from sentence_transformers import SentenceTransformer
import os
import requests
from dotenv import load_dotenv
import json
import re
from typing import List, Dict

load_dotenv()

app = FastAPI()

# CORS
origins =[
    "https://kevin-tchinda.github.io",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://0.0.0.0:3000",
    "http://0.0.0.0:8000",
]

app.add_middleware(
    CORSMiddleware, 
    allow_origins=origins, 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
)

# Configuration
DB_PATH = "./data/chroma_db"
COLLECTION_NAME = "civil_code_quebec"
MODEL_NAME = "distiluse-base-multilingual-cased"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Load embedding model and ChromaDB
model = SentenceTransformer(MODEL_NAME)
client = chromadb.PersistentClient(path=DB_PATH)
collection = client.get_collection(name=COLLECTION_NAME)

# In-memory session store
sessions: Dict[str, dict] = {}

# Request model
class QueryRequest(BaseModel):
    text: str
    session_id: str
    conversation: List[dict]

# Helper to get query embedding
def get_embedding(text: str) -> list:
    return model.encode(text).tolist()

# Improved system prompt (handles non-legal conversations, language matching)
def build_system_prompt() -> str:
    return """You are a legal assistant specialized in the Civil Code of Quebec, created by Kevin Tchinda. You must always respond in the same language as the user's last message.

Your core task is to help users with legal situations that fall under the Civil Code of Quebec. If the user asks a non-legal question (e.g., casual chat, jokes, personal questions), politely explain that you can only assist with legal matters related to the Civil Code and ask them to describe their legal situation.

For legal questions or descriptions of a situation:
- Do NOT give a direct answer immediately.
- Ask specific clarifying questions to understand the details (e.g., type of contract, parties involved, timeline, location).
- Once you have enough information, provide a short summary of what you understood and ask: "Would you like me to consult the Civil Code to find relevant articles for your case?"
- Only after the user confirms, you will be given relevant articles. Then provide a concise suggestion (2‑3 sentences) and list the article numbers at the end.

If the user insists on non-legal conversation, politely repeat that you are only a legal assistant for the Civil Code of Quebec.

Keep all responses under 150 words. Be courteous and concise.
"""

# Helper to call OpenAI API
def call_openai(messages: List[dict]) -> str:
    if not OPENAI_API_KEY:
        raise HTTPException(500, "Missing OPENAI_API_KEY")
    try:
        resp = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            json={
                "model": "gpt-4o-mini",
                "messages": messages,
                "temperature": 0.3,
                "max_completion_tokens": 400
            },
            timeout=15
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]
    except Exception as e:
        raise HTTPException(500, f"OpenAI error: {str(e)}")

# Helper to retrieve articles from ChromaDB
def retrieve_articles(query: str, n_results: int = 5):
    query_embedding = get_embedding(query)
    results = collection.query(query_embeddings=[query_embedding], n_results=n_results)
    return [(meta["number"], doc) for meta, doc in zip(results["metadatas"][0], results["documents"][0])]

# Root endpoint
@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Civil Code of Québec legal assistant API is running.",
        "endpoints": {
            "/ask": "POST endpoint to query the legal assistant"
        }
    }

# Endpoint to serve articles.json for frontend
@app.get("/articles")
async def get_articles():
    with open("data/articles.json", "r", encoding="utf-8") as f:
        return json.load(f)

# Main endpoint
@app.post("/ask")
async def ask_legal(req: QueryRequest):
    # Get or create session state
    session = sessions.get(req.session_id, {"state": "initial", "pending_query": None})
    sessions[req.session_id] = session

    # Build conversation with system prompt
    messages = [{"role": "system", "content": build_system_prompt()}]
    messages.extend(req.conversation)

    # Get LLM response
    llm_response = call_openai(messages)

    # Check if the assistant is asking for confirmation (using keywords)
    confirm_keywords = [
        "would you like me to consult", "shall i consult", "do you want me to consult",
        "souhaitez-vous que je consulte", "voulez-vous que je consulte", "puis-je consulter"
    ]
    is_asking_confirmation = any(kw in llm_response.lower() for kw in confirm_keywords)

    if is_asking_confirmation:
        # Store the user's original question for later retrieval
        user_question = next((m["content"] for m in req.conversation if m["role"] == "user"), req.text)
        session["pending_query"] = user_question
        session["state"] = "awaiting_confirmation"
        return {"answer": llm_response, "awaiting_confirmation": True}

    # If waiting for confirmation and user said yes
    if session.get("state") == "awaiting_confirmation":
        affirmative = req.text.lower() in ["yes", "y", "oui", "o", "yeah", "sure", "ok", "go ahead", "please"]
        if affirmative:
            pending = session.get("pending_query", req.text)
            articles = retrieve_articles(pending)
            if not articles:
                # Fallback (should not happen for legal queries)
                answer = "I couldn't find relevant articles. Please rephrase your legal situation or consult a lawyer. / Je n'ai pas trouvé d'articles pertinents. Veuillez reformuler votre situation juridique ou consulter un avocat."
                session["state"] = "initial"
                session["pending_query"] = None
                return {"answer": answer, "awaiting_confirmation": False}
            # Build final answer prompt with structured output
            context = "\n\n".join([f"[Article {num}]\n{text[:500]}" for num, text in articles])
            final_prompt = f"""Based on the following articles from the Civil Code of Quebec, write a short suggestion (2-3 sentences) that addresses the user's situation. Then list the article numbers at the end.

User's situation:
{pending}

Articles:
{context}

Format your response exactly as:
SUGGESTION: (your suggestion here)
SOURCES: (comma-separated article numbers)

Example:
SUGGESTION: The landlord is obliged to provide heating as an essential service.
SOURCES: 1854, 1910
"""
            final_response = call_openai([{"role": "user", "content": final_prompt}])

            # Parse the structured response
            suggestion_match = re.search(r'SUGGESTION:\s*(.*?)(?=\nSOURCES:|\Z)', final_response, re.DOTALL)
            sources_match = re.search(r'SOURCES:\s*(.*)', final_response)
            if suggestion_match and sources_match:
                suggestion = suggestion_match.group(1).strip()
                sources = sources_match.group(1).strip()
                article_numbers = [s.strip() for s in sources.split(',')]
            else:
                # Fallback: return the whole response as suggestion, no articles
                suggestion = final_response
                article_numbers = []

            session["state"] = "initial"
            session["pending_query"] = None
            return {
                "answer": suggestion,
                "awaiting_confirmation": False,
                "articles": article_numbers
            }
        else:
            session["state"] = "initial"
            session["pending_query"] = None
            return {"answer": llm_response, "awaiting_confirmation": False}

    # Normal response (no confirmation flow)
    return {"answer": llm_response, "awaiting_confirmation": False}