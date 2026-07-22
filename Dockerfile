# Use a lightweight official Python 3.11 runtime
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies (needed for lightgbm/xgboost to compile and run)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy only the requirements first to cache dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application directories
COPY app/ ./app/
COPY src/ ./src/
COPY data/models/ ./data/models/
COPY data/processed/ ./data/processed/
COPY data/raw/rossmann/store.csv ./data/raw/rossmann/store.csv


# CREATE THE ARTIFACTS FOLDER HERE
RUN mkdir -p artifacts

# Expose the API port
EXPOSE 7860

# Start the FastAPI server using Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]