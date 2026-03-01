FROM ghcr.io/astral-sh/uv:alpine3.23

WORKDIR /app
COPY app/ .
RUN uv sync --frozen
COPY start.sh /
ENTRYPOINT ["/start.sh"]
