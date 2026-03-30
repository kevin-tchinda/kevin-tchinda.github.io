FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV TRANSFORMERS_CACHE=/app/model_cache

WORKDIR /app

# Install minimal system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for caching)
COPY requirements.txt .

# Install CPU‑only PyTorch (smaller)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install remaining Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY index.py .
COPY embed.py .
COPY data/ ./data/

# Build the vector database once during image creation
RUN python embed.py

# Remove build‑time dependencies to shrink image
RUN apt-get purge -y gcc && apt-get autoremove -y

EXPOSE 8000
CMD ["sh", "-c", "uvicorn index:app --host 0.0.0.0 --port ${PORT:-8000}"]