from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chromadb
from sentence_transformers import SentenceTransformer
from langdetect import detect, LangDetectException
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS
origins = [
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
    allow_headers=["*"],
)

DB_PATH = "./data/chroma_db"
COLLECTION_NAME = "civil_code_quebec"
MODEL_NAME = "distiluse-base-multilingual-cased"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

model = SentenceTransformer(MODEL_NAME)

client = chromadb.PersistentClient(path=DB_PATH)
collection = client.get_collection(name=COLLECTION_NAME)

class QueryRequest(BaseModel):
    text: str
    language: str = "auto"

# Simple heuristic to detect conversational/non‑legal queries
def is_conversational(text: str) -> bool:
    conversational_patterns = [
        "bonjour", "salut", "coucou", "hello", "hi", "hey", "comment ça va",
        "how are you", "ça va", "what's up", "yo", "merci", "thanks", "cool",
        "super", "génial", "awesome", "ok", "d'accord"
    ]
    lower = text.lower().strip()
    # Short greetings or simple acknowledgements
    if any(p in lower for p in conversational_patterns) and len(lower) < 40:
        return True
    # Also if the query doesn't contain any legal keywords (very simple)
    legal_keywords = ["article", "code civil", "droit", "loi", "locataire", "propriétaire",
                      "contrat", "obligation", "responsabilité", "vente", "louer", "bail",
                      "assurance", "succession", "testament", "divorce", "mariage", "enfant"]
    if not any(k in lower for k in legal_keywords):
        # Very short queries that aren't legal
        if len(lower.split()) <= 3:
            return True
    return False

def detect_language(text: str) -> str:
    try:
        lang = detect(text)
        return lang if lang in ("fr", "en") else "fr"
    except LangDetectException:
        return "fr"

def get_embedding(text: str) -> list:
    return model.encode(text).tolist()

def build_prompt(question: str, context: str, lang: str) -> str:
    if lang == "en":
        return f"""You are a legal assistant specialized in the Civil Code of Québec.
Answer the question in 1-2 sentences using ONLY the provided articles if relevant.
Cite article numbers. If no article is relevant, say you don't have information.
Add a disclaimer that this is not legal advice.

QUESTION:
{question}

RELEVANT ARTICLES:
{context}

ANSWER:"""
    else:
        return f"""Tu es un assistant juridique spécialisé dans le Code civil du Québec.
Réponds en 1-2 phrases en utilisant UNIQUEMENT les articles fournis s'ils sont pertinents.
Cite les numéros d'articles. Si aucun article n'est pertinent, dis que tu n'as pas l'information.
Ajoute un avertissement que ce n'est pas un avis juridique.

QUESTION:
{question}

ARTICLES PERTINENTS:
{context}

RÉPONSE:"""

def call_openai(prompt: str, is_conversational: bool = False) -> str:
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="Missing OPENAI_API_KEY")
    try:
        system_message = (
            "You are a friendly assistant specialized in the Civil Code of Québec. "
            "Keep answers very short and friendly. If the user greets you, respond warmly."
            if is_conversational else
            "You are a legal assistant specialized in the Civil Code of Québec. "
            "Answer concisely, using only the provided articles if relevant. Cite article numbers. "
            "Add a disclaimer that this is not legal advice."
        )
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,
                "max_completion_tokens": 200
            },
            timeout=15
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Civil Code of Québec legal assistant API is running.",
        "endpoints": {
            "/ask": "POST endpoint to query the legal assistant"
        }
    }

@app.post("/ask")
async def ask_legal(req: QueryRequest):
    lang = req.language if req.language in ("fr", "en") else detect_language(req.text)

    # Step 1: If clearly conversational, skip retrieval and use friendly response
    if is_conversational(req.text):
        friendly_prompt = (
            "The user just greeted you or said something conversational. "
            "Respond warmly in the same language, inviting them to ask a legal question."
        )
        answer = call_openai(friendly_prompt, is_conversational=True)
        return {
            "query": req.text,
            "language": lang,
            "articles_used": [],
            "answer": answer
        }

    # Step 2: Legal query – retrieve articles
    try:
        query_embedding = get_embedding(req.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding error: {str(e)}")

    try:
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=3,
            include=["documents", "metadatas", "distances"]  # get distances
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vector DB error: {str(e)}")

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    # If top result distance is high, consider no relevant articles
    if not documents or distances[0] > 1.2:   # threshold may need tuning
        return {
            "query": req.text,
            "language": lang,
            "articles_used": [],
            "answer": "Je n'ai trouvé aucun article correspondant à votre question. Veuillez reformuler ou consulter un avocat."
        }

    # Build context with truncated articles
    context_blocks = []
    for doc, meta in zip(documents, metadatas):
        short_doc = doc[:400] + "..." if len(doc) > 400 else doc
        context_blocks.append(f"[Article {meta['number']}]\n{short_doc}")
    context = "\n\n".join(context_blocks)

    prompt = build_prompt(req.text, context, lang)
    answer = call_openai(prompt, is_conversational=False)

    return {
        "query": req.text,
        "language": lang,
        "articles_used": [m["number"] for m in metadatas],
        "answer": answer
    }