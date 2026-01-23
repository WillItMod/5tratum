FROM alpine:3.20

RUN apk add --no-cache bash coreutils curl tar openssl util-linux

WORKDIR /app
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
