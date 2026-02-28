FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create models/saved directory
RUN mkdir -p models/saved

EXPOSE 8000

# On Render, models will be pre-trained and included in repo
# (saved .pkl files are committed or built on deploy)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
