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

# COPY AND RENAME THE DEMO FILE FOR PRODUCTION
COPY data/processed/engineered_data_demo.parquet ./data/processed/engineered_data.parquet
COPY data/processed/merged_data_demo.parquet ./data/processed/merged_data.parquet

COPY data/raw/rossmann/store.csv ./data/raw/rossmann/store.csv

# Create empty artifacts folder
RUN mkdir -p artifacts

# Expose the API port back to 8000 for Render
EXPOSE 8000

# Start the FastAPI server using Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]