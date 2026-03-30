# **Civil Code of Québec Legal Assistant - Backend**

This directory contains the backend for the Civil Code assistant - a RAG (Retrieval-Augmented Generation) system that answers legal questions using the official Civil Code of Québec.

## Core Components

- **`scraper.py`** - Downloads the Civil Code from Légis Québec and extracts every article, saving them as `data/articles.json`.
- **`embed.py`** - Loads the articles, generates vector embeddings using the multilingual model `distiluse-base-multilingual-cased`, and stores them in a ChromaDB database (`data/chroma_db`).
- **`index.py`** - A FastAPI application that exposes a `/ask` endpoint. It accepts a user query, converts it to a vector with the same embedding model, retrieves the most relevant articles from ChromaDB, builds a prompt, and calls OpenAI’s GPT‑4o‑mini to produce a concise answer.
- **`Dockerfile` & `requirements.txt`** - Define the container environment and dependencies for deployment on Railway.
- **`.dockerignore`** - Excludes local development files from the Docker build context.

## Data

- The `data/` folder contains `articles.json` (scraped articles) and `chroma_db/` (the pre‑computed vector database). Both are committed after the initial generation.
- The model used for embeddings is `distiluse-base-multilingual-cased`, which supports both French and English.

## Deployment

The backend is deployed on Railway. The Docker image is built from this folder, and the service is exposed at a public URL.

The `/ask` endpoint accepts POST requests with a JSON body `{"text": "your question"}` and returns an answer with cited article numbers.