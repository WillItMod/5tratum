#!/usr/bin/env bash
set -euo pipefail

cd /opt/5tratumos/overlay

log() {
  printf '[overlay-up] %s\n' "$*" >&2
}

has_nonlocal_nameserver() {
  [ -f /etc/resolv.conf ] || return 1
  # Require at least one nameserver and forbid localhost DNS (which isn't running on minimal installs).
  awk '
    $1 == "nameserver" {
      ns=$2
      if (ns != "127.0.0.1" && ns != "::1" && ns != "127.0.0.53") ok=1
    }
    END { exit(ok ? 0 : 1) }
  ' /etc/resolv.conf
}

wait_for_dns() {
  local deadline_s=${1:-120}
  local start_s
  start_s="$(date +%s 2>/dev/null || echo 0)"

  while true; do
    if has_nonlocal_nameserver && getent ahostsv4 registry-1.docker.io >/dev/null 2>&1; then
      return 0
    fi

    local now_s
    now_s="$(date +%s 2>/dev/null || echo 0)"
    if [ "$start_s" -gt 0 ] && [ "$now_s" -gt 0 ] && [ $((now_s - start_s)) -ge "$deadline_s" ]; then
      return 1
    fi

    sleep 2
  done
}

wait_for_docker() {
  local deadline_s=${1:-120}
  local start_s
  start_s="$(date +%s 2>/dev/null || echo 0)"

  while true; do
    if docker info >/dev/null 2>&1; then
      return 0
    fi

    local now_s
    now_s="$(date +%s 2>/dev/null || echo 0)"
    if [ "$start_s" -gt 0 ] && [ "$now_s" -gt 0 ] && [ $((now_s - start_s)) -ge "$deadline_s" ]; then
      return 1
    fi

    sleep 2
  done
}

main() {
  log "Waiting for Docker daemon..."
  if ! wait_for_docker 180; then
    log "ERROR: Docker not ready after timeout"
    exit 1
  fi

  # On some boots, networking is up but /etc/resolv.conf is still pointing at localhost (or empty).
  # If we try to pull before DNS is usable, the overlay service fails and won't retry automatically.
  log "Waiting for DNS..."
  if ! wait_for_dns 180; then
    log "WARN: DNS not ready after timeout; attempting compose up anyway"
  fi

  local attempt=0
  while true; do
    attempt=$((attempt + 1))
    log "Starting portal (attempt ${attempt})..."
    if /usr/bin/docker compose --project-name 5tratumos-overlay up -d; then
      log "Portal started"
      exit 0
    fi
    sleep 3
  done
}

main "$@"

