# Multi-stage Dockerfile for Somnium ECMO Platform
FROM python:3.11-slim AS base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    UV_SYSTEM_PYTHON=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv globally using the official method for system-wide installation
RUN curl -LsSf https://astral.sh/uv/install.sh | sh && \
    cp /root/.local/bin/uv /usr/local/bin/uv && \
    cp /root/.local/bin/uvx /usr/local/bin/uvx && \
    chmod 755 /usr/local/bin/uv /usr/local/bin/uvx

# Create non-root user early
RUN useradd -m -u 1000 somnium

# Set working directory and ownership
WORKDIR /app
RUN chown somnium:somnium /app

# Switch to non-root user for dependency installation
USER somnium

# Add virtual environment to PATH
ENV PATH="/app/.venv/bin:$PATH"

# Copy uv project files
COPY --chown=somnium:somnium pyproject.toml uv.lock ./

# Install dependencies using uv
RUN uv sync --frozen --no-dev

# Copy application code
COPY --chown=somnium:somnium app ./app
COPY --chown=somnium:somnium alembic ./alembic
COPY --chown=somnium:somnium alembic.ini ./
COPY --chown=somnium:somnium scripts ./scripts

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run migrations and start application
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]