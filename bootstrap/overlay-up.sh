#!/usr/bin/env bash
set -euo pipefail

cd /opt/5tratumos/overlay

log() {
  printf '[overlay-up] %s\n' "$*" >&2
}

compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
    return $?
  fi
  if command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
    return $?
  fi
  log "ERROR: docker compose not available (install docker-compose-plugin or docker-compose)"
  return 127
}

dns_ready() {
  if command -v getent >/dev/null 2>&1; then
    getent ahostsv4 registry-1.docker.io >/dev/null 2>&1
    return $?
  fi
  if command -v curl >/dev/null 2>&1; then
    curl -fsSI --max-time 5 https://registry-1.docker.io >/dev/null 2>&1
    return $?
  fi
  return 1
}

wait_for_dns() {
  local deadline_s=${1:-120}
  local start_s
  start_s="$(date +%s 2>/dev/null || echo 0)"

  while true; do
    if dns_ready; then
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

overlay_up() {
  log "Waiting for Docker daemon..."
  if ! wait_for_docker 180; then
    log "ERROR: Docker not ready after timeout"
    exit 1
  fi

  log "Waiting for DNS..."
  if ! wait_for_dns 180; then
    log "ERROR: DNS not ready after timeout"
    exit 1
  fi

  log "Starting portal..."
  compose --project-name 5tratumos-overlay up -d
  log "Portal started"
}

overlay_down() {
  log "Stopping portal..."
  # Don't fail shutdown just because Compose isn't installed/running.
  compose --project-name 5tratumos-overlay down || true
  log "Portal stopped"
}

main() {
  case "${1:-up}" in
    up) overlay_up ;;
    down) overlay_down ;;
    *) log "Usage: $0 [up|down]"; exit 2 ;;
  esac
}

main "$@"
