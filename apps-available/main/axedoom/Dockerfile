FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
  chocolate-doom \
  freedoom \
  fluxbox \
  novnc \
  websockify \
  x11vnc \
  xvfb \
  && rm -rf /var/lib/apt/lists/*

COPY start.sh /usr/local/bin/start.sh
COPY index.html /usr/share/novnc/index.html
RUN chmod +x /usr/local/bin/start.sh \
  && useradd -m -u 1000 -s /bin/bash app \
  && mkdir -p /data \
  && chown -R app:app /data

USER app
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/start.sh"]
