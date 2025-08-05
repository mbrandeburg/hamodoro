FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy requirements first for better caching
COPY requirements.txt ./

# Install dependencies
RUN uv pip install --system -r requirements.txt

# Copy project files
COPY app.py ./
COPY templates/ ./templates/
COPY static/ ./static/

# Expose port
EXPOSE 9055

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Run the application
CMD ["python", "app.py"]
