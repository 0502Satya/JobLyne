# Stage 1: Build dependency wheelhouse
FROM python:3.11-slim AS builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Optimized final image
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root system user and group
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -m -s /bin/bash appuser

# Copy installed libraries from builder stage into appuser local directory
COPY --from=builder /root/.local /home/appuser/.local

# Set environment PATH and options
ENV PATH=/home/appuser/.local/bin:$PATH \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Copy code with ownership set to appuser
COPY --chown=appuser:appgroup . .

# Set permissions for the entrypoint script
RUN chmod +x /app/entrypoint.sh

# Change ownership of /app
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]

# Startup command running the Django application under Gunicorn
CMD ["gunicorn", "core.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "4", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]

