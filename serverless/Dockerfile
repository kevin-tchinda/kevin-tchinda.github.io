# ── Base image ────────────────────────────────────────────────────────────────
FROM python:3.11-slim

# ── Environment ───────────────────────────────────────────────────────────────
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV TRANSFORMERS_CACHE=/app/model_cache

# ── Workdir ───────────────────────────────────────────────────────────────────
WORKDIR /app

# ── System dependencies (minimal for torch) ───────────────────────────────────
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# ── Install Python dependencies (cached layer) ────────────────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Preload embedding model (critical for cold start) ─────────────────────────
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')"

# ── Copy application code ─────────────────────────────────────────────────────
COPY . .

# ── Expose port (informational) ───────────────────────────────────────────────
EXPOSE 8000

# ── Run FastAPI ───────────────────────────────────────────────────────────────
CMD ["uvicorn", "index:app", "--host", "0.0.0.0", "--port", "8000"]
