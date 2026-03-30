FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV TRANSFORMERS_CACHE=/app/model_cache

WORKDIR /app

# Minimal system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install CPU-only PyTorch (much smaller)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install remaining Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy only the runtime‑essential files (exclude large dev files via .dockerignore)
COPY index.py .
COPY data/chroma_db ./data/chroma_db    # if you pre‑built the DB, copy it
# If you want to rebuild the DB at runtime, omit the above line and run embed.py at startup

# Remove build‑time compilers to shrink the image
RUN apt-get purge -y gcc && apt-get autoremove -y

EXPOSE 8000

# Start the app (you can also add a startup script to run embed.py if needed)
CMD ["sh", "-c", "uvicorn index:app --host 0.0.0.0 --port ${PORT:-8000}"]