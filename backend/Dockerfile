FROM ghcr.io/astral-sh/uv:alpine3.23

WORKDIR /app
ENTRYPOINT ["uv", "run", "fastapi", "dev", "sources/main.py", "--host", "0.0.0.0"]
