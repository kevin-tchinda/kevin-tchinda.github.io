from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import chromadb
from sentence_transformers import SentenceTransformer
from langdetect import detect, LangDetectException
import os
import requests
from dotenv import load_dotenv

load_dotenv()

# Authenticate to Hugging Face Hub if token is provided
HF_API_KEY = os.getenv("HF_API_KEY")
if HF_API_KEY:
    os.environ["HF_TOKEN"] = HF_API_KEY

app = FastAPI()

# Configuration
DB_PATH = "./data/chroma_db"
COLLECTION_NAME = "civil_code_quebec"
MODEL_NAME = "distiluse-base-multilingual-cased"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Load the embedding model once
model = SentenceTransformer(MODEL_NAME)

# Connect to ChromaDB (no embedding function needed; we pass vectors manually)
client = chromadb.PersistentClient(path=DB_PATH)
collection = client.get_collection(name=COLLECTION_NAME)

class QueryRequest(BaseModel):
    text: str
    language: str = "auto"   # "auto", "fr", or "en"

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
Answer ONLY using the provided articles.
Cite article numbers explicitly.
Translate excerpts if needed.
Add a disclaimer that this is not legal advice.

QUESTION:
{question}

CONTEXT:
{context}

ANSWER:"""
    else:
        return f"""Tu es un assistant juridique spécialisé dans le Code civil du Québec.
Réponds UNIQUEMENT avec les articles fournis.
Cite les numéros d'articles.
Ajoute un avertissement que ce n'est pas un avis juridique.

QUESTION:
{question}

CONTEXTE:
{context}

RÉPONSE:"""

def call_openai(prompt: str) -> str:
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="Missing OPENAI_API_KEY")
    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            json={
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
                "max_completion_tokens": 800
            },
            timeout=15
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="LLM request timed out")
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

    # Get query embedding using the local model
    try:
        query_embedding = get_embedding(req.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding error: {str(e)}")

    # Retrieve from ChromaDB using the vector
    try:
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=7
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vector DB error: {str(e)}")

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]

    if not documents:
        raise HTTPException(status_code=404, detail="No relevant articles found")

    context_blocks = [f"[Article {meta['number']}]\n{doc}" for doc, meta in zip(documents, metadatas)]
    context = "\n\n".join(context_blocks)

    prompt = build_prompt(req.text, context, lang)
    answer = call_openai(prompt)

    return {
        "query": req.text,
        "language": lang,
        "articles_used": [m["number"] for m in metadatas],
        "answer": answer
    }




# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# import chromadb
# from sentence_transformers import SentenceTransformer
# from langdetect import detect, LangDetectException
# import os
# import requests
# from dotenv import load_dotenv

# load_dotenv()

# app = FastAPI()

# # Load vector DB and embedder once (global for Railway container)
# client = chromadb.PersistentClient(path="./data/chroma_db")
# collection = client.get_collection("civil_code_quebec")
# embedder = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')


# class QueryRequest(BaseModel):
#     text: str
#     language: str = "auto"  # "auto", "fr", or "en"


# def detect_language(text: str) -> str:
#     """
#     Detects language from query text.
#     Falls back to "fr" if detection fails (our data is French,
#     so French is the safer default).
#     """
#     try:
#         lang = detect(text)
#         return lang if lang in ("fr", "en") else "fr"
#     except LangDetectException:
#         return "fr"


# def build_prompt(question: str, context: str, lang: str) -> str:
#     if lang == "en":
#         return f"""You are a legal assistant specialized in the Civil Code of Québec.
# Answer the following question based ONLY on the provided Civil Code articles.
# Cite article numbers in your answer. The source articles are in French — translate relevant excerpts as needed.
# Add a disclaimer that this is not legal advice.

# QUESTION: {question}

# RELEVANT CIVIL CODE ARTICLES:
# {context}

# ANSWER:"""
#     else:
#         return f"""Tu es un assistant juridique spécialisé dans le Code civil du Québec.
# Réponds à la question suivante en te basant UNIQUEMENT sur les articles du Code civil fournis.
# Cite les numéros d'articles dans ta réponse. Ajoute un avertissement que ce n'est pas un avis juridique.

# QUESTION: {question}

# ARTICLES PERTINENTS DU CODE CIVIL:
# {context}

# RÉPONSE:"""


# @app.post("/ask")
# async def ask_legal(req: QueryRequest):
#     # 1. Resolve language
#     lang = req.language if req.language in ("fr", "en") else detect_language(req.text)

#     # 2. Embed query
#     query_embedding = embedder.encode(req.text).tolist()

#     # 3. Retrieve relevant articles
#     results = collection.query(query_embeddings=[query_embedding], n_results=7)
#     documents = results['documents'][0]
#     metadatas = results['metadatas'][0]

#     # 4. Build context and prompt
#     context = "\n\n".join([f"Article {m['number']} : {d}" for d, m in zip(documents, metadatas)])
#     prompt = build_prompt(req.text, context, lang)

#     # ── OpenAI gpt-4o-mini ────────────────────────────────────────────────────
#     OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
#     response = requests.post(
#         "https://api.openai.com/v1/chat/completions",
#         headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
#         json={
#             "model": "gpt-4o-mini",
#             "messages": [{"role": "user", "content": prompt}],
#             "temperature": 0.3,
#             "max_tokens": 800
#         }
#     )
#     answer = response.json()["choices"][0]["message"]["content"]

#     # ── DeepSeek (commented out — uncomment to switch back) ───────────────────
#     # DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
#     # response = requests.post(
#     #     "https://api.deepseek.com/v1/chat/completions",
#     #     headers={"Authorization": f"Bearer {DEEPSEEK_API_KEY}"},
#     #     json={
#     #         "model": "deepseek-chat",
#     #         "messages": [{"role": "user", "content": prompt}],
#     #         "temperature": 0.3,
#     #         "max_tokens": 800
#     #     }
#     # )
#     # answer = response.json()["choices"][0]["message"]["content"]