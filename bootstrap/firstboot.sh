#!/usr/bin/env bash
set -euo pipefail

DONE_FILE="/etc/5tratumos/firstboot.done"

mkdir -p /etc/5tratumos

ensure_hostname() {
  local desired="5tratumos"
  local cur=""
  cur="$(cat /etc/hostname 2>/dev/null | tr -d '\r\n' | head -n 1 || true)"
  if [ -z "${cur}" ] || [ "${cur}" = "localhost" ] || [ "${cur}" = "localhost.localdomain" ]; then
    printf '%s\n' "${desired}" >/etc/hostname
    if command -v hostnamectl >/dev/null 2>&1; then
      hostnamectl set-hostname "${desired}" >/dev/null 2>&1 || true
    fi
    if grep -qE '^127\\.0\\.1\\.1\\s' /etc/hosts 2>/dev/null; then
      sed -i -E "s/^127\\.0\\.1\\.1\\s+.*/127.0.1.1\\t${desired}/" /etc/hosts 2>/dev/null || true
    else
      printf '127.0.1.1\t%s\n' "${desired}" >>/etc/hosts
    fi
  fi
}

ensure_mdns() {
  if command -v systemctl >/dev/null 2>&1 && systemctl list-unit-files avahi-daemon.service >/dev/null 2>&1; then
    systemctl enable --now avahi-daemon.service >/dev/null 2>&1 || true
  fi
}

ensure_grub_boot() {
  # Some systems show a GRUB menu on the first reboot if recordfail is set.
  # Make boot unattended by clearing recordfail and using a short timeout.
  if command -v grub-editenv >/dev/null 2>&1; then
    grub-editenv - unset recordfail >/dev/null 2>&1 || true
  fi

  local grub_default="/etc/default/grub"
  if [ ! -f "${grub_default}" ]; then
    return 0
  fi

  local changed="0"
  if ! grep -qE '^GRUB_TIMEOUT_STYLE=' "${grub_default}" 2>/dev/null; then
    printf '\nGRUB_TIMEOUT_STYLE=hidden\n' >>"${grub_default}"
    changed="1"
  else
    sed -i 's/^GRUB_TIMEOUT_STYLE=.*/GRUB_TIMEOUT_STYLE=hidden/' "${grub_default}" 2>/dev/null || true
    changed="1"
  fi
  if ! grep -qE '^GRUB_TIMEOUT=' "${grub_default}" 2>/dev/null; then
    printf 'GRUB_TIMEOUT=1\n' >>"${grub_default}"
    changed="1"
  else
    sed -i 's/^GRUB_TIMEOUT=.*/GRUB_TIMEOUT=1/' "${grub_default}" 2>/dev/null || true
    changed="1"
  fi
  if ! grep -qE '^GRUB_RECORDFAIL_TIMEOUT=' "${grub_default}" 2>/dev/null; then
    printf 'GRUB_RECORDFAIL_TIMEOUT=1\n' >>"${grub_default}"
    changed="1"
  else
    sed -i 's/^GRUB_RECORDFAIL_TIMEOUT=.*/GRUB_RECORDFAIL_TIMEOUT=1/' "${grub_default}" 2>/dev/null || true
    changed="1"
  fi

  if [ "${changed}" = "1" ] && command -v update-grub >/dev/null 2>&1; then
    update-grub >/dev/null 2>&1 || true
  fi
}

ensure_hostname
ensure_mdns
ensure_grub_boot

if [ ! -s /etc/machine-id ]; then
  if command -v systemd-machine-id-setup >/dev/null 2>&1; then
    systemd-machine-id-setup >/dev/null 2>&1 || true
  fi
fi

if command -v ssh-keygen >/dev/null 2>&1; then
  if ! ls /etc/ssh/ssh_host_* >/dev/null 2>&1; then
    ssh-keygen -A >/dev/null 2>&1 || true
  fi
fi

# Normalize common keyboard layout alias to avoid console-setup failures.
# Debian console-setup expects "gb" (symbols/gb), but some installs end up with "uk" which does not exist.
if [ -f /etc/default/keyboard ]; then
  if grep -Eq '^XKBLAYOUT="uk"$' /etc/default/keyboard 2>/dev/null; then
    sed -i 's/^XKBLAYOUT="uk"$/XKBLAYOUT="gb"/' /etc/default/keyboard 2>/dev/null || true
    # Best-effort: immediately apply so the local console isn't stuck without a keymap.
    if command -v setupcon >/dev/null 2>&1; then
      setupcon -f --force >/dev/null 2>&1 || true
    fi
    systemctl restart console-setup.service >/dev/null 2>&1 || true
  fi
fi

if [ ! -f /etc/5tratumos/console.json ]; then
  cat >/etc/5tratumos/console.json <<'EOF'
{"enabled":true,"prompted":false,"user":"forge"}
EOF
  chmod 600 /etc/5tratumos/console.json || true
fi

# Default: enable kiosk mode (fullscreen local console) when a local display exists.
# This is a no-op on headless systems.
if ( [ -e /dev/dri/card0 ] || [ -e /dev/fb0 ] ) && [ -f /opt/5tratumos/console/install.sh ]; then
  # Bundles built on Windows may land with CRLF and without exec bits; normalize so installs work.
  if command -v sed >/dev/null 2>&1; then
    sed -i 's/\r$//' /opt/5tratumos/console/*.sh >/dev/null 2>&1 || true
  fi
  chmod 0755 /opt/5tratumos/console/*.sh >/dev/null 2>&1 || true

  # Don't block boot/SSH while installing large UI packages (chromium/cage).
  if command -v systemd-run >/dev/null 2>&1; then
    systemd-run \
      --unit=5tratumos-console-install \
      --property=After=network-online.target \
      --property=Wants=network-online.target \
      /bin/bash /opt/5tratumos/console/install.sh >/dev/null 2>&1 || true
  else
    ( /bin/bash /opt/5tratumos/console/install.sh || true ) >/dev/null 2>&1 &
  fi
fi

if [ -x /opt/5tratumos/bootstrap/os-tune.sh ]; then
  /opt/5tratumos/bootstrap/os-tune.sh || true
fi

if [ -x /opt/5tratumos/bootstrap/growfs.sh ]; then
  /opt/5tratumos/bootstrap/growfs.sh || true
fi

date -u +"%Y-%m-%dT%H:%M:%SZ" >"${DONE_FILE}"
