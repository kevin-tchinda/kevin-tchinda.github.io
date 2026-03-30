import json
import math
import chromadb
from chromadb.utils import embedding_functions
import os

DB_PATH = "./data/chroma_db"
COLLECTION_NAME = "civil_code_quebec"
MODEL_NAME = "distiluse-base-multilingual-cased"   # <-- new model
BATCH_SIZE = 100

# Authenticate to Hugging Face Hub if token is provided
HF_API_KEY = os.getenv("HF_API_KEY")
if HF_API_KEY:
    os.environ["HF_TOKEN"] = HF_API_KEY

def load_articles(path: str):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def build_metadata(article: dict) -> dict:
    return {
        "number": article["number"],
        "livre": article.get("livre", ""),
        "titre": article.get("titre", ""),
        "chapitre": article.get("chapitre", ""),
        "section": article.get("section", ""),
        "paragraphe": article.get("paragraphe", ""),
    }

def chunked(iterable, size):
    for i in range(0, len(iterable), size):
        yield iterable[i:i + size]

def embed_articles():
    print("Loading articles...")
    articles = load_articles("data/articles.json")
    total = len(articles)
    print(f"  {total} articles loaded")

    client = chromadb.PersistentClient(path=DB_PATH)

    embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name=MODEL_NAME
    )

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=embedding_function
    )

    existing = collection.count()
    if existing > 0:
        print(f"Vector DB already contains {existing} documents")
        # If you want to rebuild, delete the DB folder and rerun
        return

    print("Starting embedding...")
    total_batches = math.ceil(total / BATCH_SIZE)

    for batch_idx, batch in enumerate(chunked(articles, BATCH_SIZE), start=1):
        ids = [f"art_{a['number']}" for a in batch]
        documents = [a["text"] for a in batch]
        metadatas = [build_metadata(a) for a in batch]

        collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas
        )

        print(f"  Batch {batch_idx}/{total_batches} "
              f"({min(batch_idx * BATCH_SIZE, total)}/{total})")

    print(f"\nDone. Embedded {total} articles into '{COLLECTION_NAME}'")

if __name__ == "__main__":
    embed_articles()