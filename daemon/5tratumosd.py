#!/usr/bin/env python3
import argparse
import concurrent.futures
import base64
import hashlib
import hmac
import json
import os
import re
import datetime
import calendar
import secrets
import shlex
import shutil
import subprocess
import sys
import tarfile
import socket
import threading
import time
import urllib.error
import urllib.request
from collections.abc import Callable
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse


def _legacy_brand() -> str:
    return "".join(["f", "o", "r", "g", "e", "o", "s"])


def _legacy_env_key(suffix: str) -> str:
    return "".join(["F", "O", "R", "G", "E", "O", "S", "_"]) + suffix


def _env(key: str, default: str | None = None) -> str | None:
    val = os.environ.get(f"FIVETRATUMOS_{key}")
    if val is None:
        val = os.environ.get(_legacy_env_key(key))
    if val is None:
        return default
    return val


ROOT_DIR = str(_env("ROOT", "/opt/5tratumos") or "/opt/5tratumos")
APPS_DIR = os.path.join(ROOT_DIR, "apps")
DATA_DIR = str(_env("DATA_DIR", "/srv/5tratumos-data") or "/srv/5tratumos-data")
STATE_DIR = str(_env("STATE_DIR", "/var/lib/5tratumos") or "/var/lib/5tratumos")
SUPPORT_DIR = str(_env("SUPPORT_DIR", os.path.join(STATE_DIR, "support")) or os.path.join(STATE_DIR, "support"))
INSTALLED_APPS_FILE = os.path.join(STATE_DIR, "apps_installed.json")
CHANNEL_FILE = str(_env("CHANNEL_FILE", "/etc/5tratumos/channel") or "/etc/5tratumos/channel")
STORE_DIR = str(_env("STORE_DIR", os.path.join(ROOT_DIR, "store")) or os.path.join(ROOT_DIR, "store"))
GLOBAL_STORE_REPO = str(_env("GLOBAL_STORE_REPO", "WillItMod/global-apps") or "WillItMod/global-apps")
GLOBAL_STORE_BRANCH = str(_env("GLOBAL_STORE_BRANCH", "master") or "master")
# Optional: an assets repo for Global App Store icons/gallery.
# Defaults to WillItMod/global-apps-gallery (can be overridden via env).
GLOBAL_ASSETS_REPO = str(_env("GLOBAL_ASSETS_REPO", "WillItMod/global-apps-gallery") or "WillItMod/global-apps-gallery")
GLOBAL_ASSETS_BRANCH = str(_env("GLOBAL_ASSETS_BRANCH", "main") or "main")
AUTH_FILE = str(_env("AUTH_FILE", "/etc/5tratumos/auth.json") or "/etc/5tratumos/auth.json")
FEATURES_FILE = str(_env("FEATURES_FILE", "/etc/5tratumos/features.json") or "/etc/5tratumos/features.json")
BUILD_FILE = str(_env("BUILD_FILE", "/etc/5tratumos/build.json") or "/etc/5tratumos/build.json")
UPDATE_REPO = str(_env("UPDATE_REPO", "WillItMod/5tratum") or "WillItMod/5tratum")
UPDATE_CONFIG_FILE = str(_env("UPDATE_CONFIG_FILE", "/etc/5tratumos/update.json") or "/etc/5tratumos/update.json")
UPDATE_TOKEN_FILE = str(_env("UPDATE_TOKEN_FILE", "/etc/5tratumos/update.token") or "/etc/5tratumos/update.token")
UPDATE_PUBKEY_FILE = str(_env("UPDATE_PUBKEY_FILE", "/etc/5tratumos/update_signing.pub") or "/etc/5tratumos/update_signing.pub")
UPDATE_REQUIRE_SIG = str(_env("UPDATE_REQUIRE_SIG", "0") or "0").strip() == "1"
STORE_CONFIG_FILE = str(_env("STORE_CONFIG_FILE", "/etc/5tratumos/store.json") or "/etc/5tratumos/store.json")
STORE_MAIN_REPO = str(_env("MAIN_STORE_REPO", "WillItMod/umbrel-community-store") or "WillItMod/umbrel-community-store").strip()
STORE_MAIN_BRANCH = str(_env("MAIN_STORE_BRANCH", "main") or "main").strip()
STORE_DEV_REPO = str(_env("DEV_STORE_REPO", "WillItMod/umbrel-dev-community-store") or "WillItMod/umbrel-dev-community-store").strip()
STORE_DEV_BRANCH = str(_env("DEV_STORE_BRANCH", "main") or "main").strip()
HTTPS_CONFIG_FILE = str(_env("HTTPS_CONFIG_FILE", "/etc/5tratumos/https.json") or "/etc/5tratumos/https.json")
SESSION_CONFIG_FILE = str(_env("SESSION_CONFIG_FILE", "/etc/5tratumos/session.json") or "/etc/5tratumos/session.json")
DESKTOP_STATE_FILE = str(_env("DESKTOP_STATE_FILE", "/etc/5tratumos/desktop.json") or "/etc/5tratumos/desktop.json")
APPS_PAGES_FILE = str(_env("APPS_PAGES_FILE", "/etc/5tratumos/apps_pages.json") or "/etc/5tratumos/apps_pages.json")
NOTIFY_CONFIG_FILE = str(_env("NOTIFY_CONFIG_FILE", "/etc/5tratumos/notify.json") or "/etc/5tratumos/notify.json")
CONSOLE_CONFIG_FILE = str(_env("CONSOLE_CONFIG_FILE", "/etc/5tratumos/console.json") or "/etc/5tratumos/console.json")
STORAGE_CONFIG_FILE = str(_env("STORAGE_CONFIG_FILE", "/etc/5tratumos/storage.json") or "/etc/5tratumos/storage.json")
WATCHDOG_CONFIG_FILE = str(_env("WATCHDOG_CONFIG_FILE", "/etc/5tratumos/watchdog.json") or "/etc/5tratumos/watchdog.json")
UI_CONFIG_FILE = str(_env("UI_CONFIG_FILE", "/etc/5tratumos/ui.json") or "/etc/5tratumos/ui.json")
API_CACHE_DIR = str(_env("API_CACHE_DIR", "/var/cache/5tratumos/api") or "/var/cache/5tratumos/api")
UPDATE_TOKEN_ENV = str(_env("UPDATE_TOKEN", "") or os.environ.get("GITHUB_TOKEN") or "").strip()
UPDATE_ALLOW_UNVERIFIED = str(_env("UPDATE_ALLOW_UNVERIFIED", "0") or "0").strip() == "1"
SESSION_TTL_S = int(str(_env("SESSION_TTL_S", "86400") or "86400"))
SESSION_COOKIE = str(_env("SESSION_COOKIE", "5tratumos_session") or "5tratumos_session")
# Workers with 0 hashrate and a last-share older than this are considered stale and are hidden
# from the Fleet "Workers" table (the pool endpoints may retain historical worker entries).
WORKER_STALE_S = int(str(_env("WORKER_STALE_S", "900") or "900"))
WORKER_ACTIVE_S = int(str(_env("WORKER_ACTIVE_S", "300") or "300"))
WORKER_PRUNE_S = int(str(_env("WORKER_PRUNE_S", "86400") or "86400"))
# Default to the public Axebench endpoint (never rely on private LAN IPs).
DEFAULT_SUPPORT_BASE_URL = str(_env("SUPPORT_BASE_URL", "https://axebench.dreamnet.uk") or "https://axebench.dreamnet.uk").strip()
_SUPPORT_CHECKIN_URL_RAW = _env("SUPPORT_CHECKIN_URL")
if _SUPPORT_CHECKIN_URL_RAW is not None and str(_SUPPORT_CHECKIN_URL_RAW).strip():
    SUPPORT_CHECKIN_URL = str(_SUPPORT_CHECKIN_URL_RAW).strip()
else:
    base = (DEFAULT_SUPPORT_BASE_URL or "").strip().rstrip("/")
    # If the base already includes the ping path, don't append again.
    if base.endswith("/api/telemetry/ping"):
        SUPPORT_CHECKIN_URL = base
    else:
        SUPPORT_CHECKIN_URL = f"{base}/api/telemetry/ping" if base else ""
SUPPORT_CHECKIN_ENABLED = str(_env("SUPPORT_CHECKIN_ENABLED", "1") or "1").strip().lower() not in {"0", "false", "no", "off"}
INSTALL_ID_HEADER = "X-Install-Id"
INSTALL_ID_PATH = os.path.join(SUPPORT_DIR, "install_id.txt")
CHECKIN_STATE_PATH = os.path.join(SUPPORT_DIR, "checkin.json")
_AUTH_LOCK = threading.Lock()
_SESSIONS: dict[str, dict] = {}

_API_CACHE_LOCK = threading.Lock()
_API_REFRESH_INFLIGHT: set[str] = set()

try:
    import yaml  # type: ignore
except Exception:  # pragma: no cover
    yaml = None


def _now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def run_cmd(
    args: list[str],
    *,
    cwd: str | None = None,
    timeout_s: int = 120,
    input: str | None = None,
) -> subprocess.CompletedProcess:
    try:
        return subprocess.run(
            args,
            cwd=cwd,
            timeout=timeout_s,
            input=input,
            capture_output=True,
            text=True,
            check=False,
        )
    except subprocess.TimeoutExpired as e:
        return subprocess.CompletedProcess(
            args=e.cmd if isinstance(e.cmd, list) else list(args),
            returncode=124,
            stdout=str(getattr(e, "stdout", "") or ""),
            stderr=str(getattr(e, "stderr", "") or "timeout"),
        )


def _which(cmd: str) -> str:
    try:
        return shutil.which(cmd) or ""
    except Exception:
        return ""


def _is_path_under(path: str, root: str) -> bool:
    try:
        p = os.path.realpath(path)
        r = os.path.realpath(root)
        return p == r or p.startswith(r.rstrip("/") + "/")
    except Exception:
        return False


def _write_json_atomic(path: str, obj: dict) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = f"{path}.tmp"
    raw = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(raw)
    os.replace(tmp, path)


def _write_text_atomic(path: str, value: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = f"{path}.tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(str(value))
    os.replace(tmp, path)


def _read_json(path: str) -> dict:
    if not os.path.isfile(path):
        return {}
    try:
        obj = json.loads(Path(path).read_text(encoding="utf-8"))
    except Exception:
        return {}
    return obj if isinstance(obj, dict) else {}


def _read_text(path: str) -> str:
    try:
        return Path(path).read_text(encoding="utf-8", errors="replace").strip()
    except Exception:
        return ""


def _write_text(path: str, value: str) -> None:
    try:
        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(str(value).strip() + "\n", encoding="utf-8")
    except Exception:
        pass


def _get_or_create_install_id() -> str:
    existing = _read_text(INSTALL_ID_PATH)
    if existing:
        return existing
    new_id = secrets.token_hex(16)
    _write_text(INSTALL_ID_PATH, new_id)
    return new_id


def _post_json(url: str, payload: dict, *, timeout_s: int = 6, headers: dict | None = None) -> None:
    body = json.dumps(payload).encode("utf-8")
    all_headers = {"Content-Type": "application/json", "User-Agent": "5tratumOS"}
    if headers:
        all_headers.update(headers)
    req = urllib.request.Request(url, data=body, headers=all_headers, method="POST")
    with urllib.request.urlopen(req, timeout=timeout_s):  # nosec - expected target
        return


def _default_console_config() -> dict:
    return {
        "enabled": True,
        "prompted": False,
        "user": str(_env("FIVETRATUMOS_CONSOLE_USER", "forge") or "forge"),
    }


def read_console_config() -> dict:
    cfg = _read_json(CONSOLE_CONFIG_FILE)
    if not isinstance(cfg, dict):
        cfg = {}
    base = _default_console_config()
    base.update(cfg)
    base["enabled"] = bool(base.get("enabled"))
    base["prompted"] = bool(base.get("prompted"))
    base["user"] = _normalize_username(str(base.get("user") or "forge"))
    return base


def write_console_config(cfg: dict) -> None:
    _write_json_atomic(CONSOLE_CONFIG_FILE, cfg)
    try:
        os.chmod(CONSOLE_CONFIG_FILE, 0o600)
    except Exception:
        pass


def _console_unit_for_user(user: str) -> str:
    u = _normalize_username(user or "forge")
    return f"5tratumos-console@{u}.service"


def console_status() -> dict:
    cfg = read_console_config()
    unit = _console_unit_for_user(cfg.get("user") or "forge")

    enabled = bool(cfg.get("enabled"))
    prompted = bool(cfg.get("prompted"))
    reason = ""
    active = None

    if not enabled:
        reason = "kiosk disabled"
        return {
            "ok": True,
            "enabled": False,
            "prompted": prompted,
            "user": cfg.get("user"),
            "active": False,
            "unit": unit,
            "reason": reason,
        }

    if not os.path.exists("/dev/dri/card0"):
        reason = "no GPU detected"

    try:
        is_active = subprocess.run(["systemctl", "is-active", unit], capture_output=True, text=True, timeout=2)
        active = is_active.returncode == 0
    except Exception:
        active = None

    return {
        "ok": True,
        "enabled": enabled,
        "prompted": prompted,
        "user": cfg.get("user"),
        "unit": unit,
        "active": active,
        "reason": reason,
    }


def set_console_enabled(*, enabled: bool) -> dict:
    cfg = read_console_config()
    unit = _console_unit_for_user(cfg.get("user") or "forge")

    cfg["enabled"] = bool(enabled)
    write_console_config(cfg)

    if not enabled:
        try:
            subprocess.run(["systemctl", "disable", "--now", unit], check=False, timeout=12)
        except Exception:
            pass
        try:
            subprocess.run(["systemctl", "enable", "--now", "getty@tty1.service"], check=False, timeout=12)
        except Exception:
            pass
        st = console_status()
        st["ok"] = True
        return st

    if not os.path.exists("/usr/local/bin/5tratumos-console") or not os.path.exists("/etc/systemd/system/5tratumos-console@.service"):
        installer = "/opt/5tratumos/console/install.sh"
        if os.path.exists(installer):
            try:
                _normalize_crlf_inplace(installer)
                os.chmod(installer, 0o755)
            except Exception:
                pass
            subprocess.run(["bash", installer], check=False, timeout=15 * 60)

    try:
        subprocess.run(["systemctl", "daemon-reload"], check=False, timeout=15)
    except Exception:
        pass
    try:
        subprocess.run(["systemctl", "enable", "--now", unit], check=False, timeout=12)
    except Exception:
        pass

    st = console_status()
    st["ok"] = True
    return st


def _api_cache_path(name: str) -> str:
    safe = re.sub(r"[^a-zA-Z0-9_.-]+", "_", str(name or "cache").strip())[:120] or "cache"
    return os.path.join(API_CACHE_DIR, f"{safe}.json")


def _api_cache_read(name: str) -> dict:
    return _read_json(_api_cache_path(name))


def _api_cache_write(name: str, payload: dict) -> None:
    wrapper = {"saved_at": _now_iso(), "payload": payload if isinstance(payload, dict) else {}}
    _write_json_atomic(_api_cache_path(name), wrapper)


def _api_cache_payload(name: str) -> tuple[dict | None, float]:
    wrapper = _api_cache_read(name)
    payload = wrapper.get("payload") if isinstance(wrapper, dict) else None
    saved_at = str(wrapper.get("saved_at") or "").strip() if isinstance(wrapper, dict) else ""
    age_s = 0.0
    if saved_at:
        try:
            # saved_at is in UTC Z form; parse with time.strptime
            t = time.strptime(saved_at, "%Y-%m-%dT%H:%M:%SZ")
            age_s = max(0.0, time.time() - float(calendar.timegm(t)))
        except Exception:
            age_s = 0.0
    return (payload if isinstance(payload, dict) else None), age_s


def _api_cache_get_or_refresh(
    *,
    cache_key: str,
    compute: callable,
    max_age_s: int,
) -> dict:
    payload, age_s = _api_cache_payload(cache_key)
    if payload is not None:
        out = {**payload}
        out["_cache"] = {"hit": True, "age_s": round(age_s, 2), "stale": age_s > max_age_s}
        if age_s > max_age_s:
            with _API_CACHE_LOCK:
                if cache_key not in _API_REFRESH_INFLIGHT:
                    _API_REFRESH_INFLIGHT.add(cache_key)

                    def _bg() -> None:
                        try:
                            fresh = compute()
                            if isinstance(fresh, dict) and fresh.get("ok") is True:
                                _api_cache_write(cache_key, fresh)
                        finally:
                            with _API_CACHE_LOCK:
                                _API_REFRESH_INFLIGHT.discard(cache_key)

                    t = threading.Thread(target=_bg, name=f"api-cache:{cache_key}", daemon=True)
                    t.start()
        return out

    fresh = compute()
    if isinstance(fresh, dict) and fresh.get("ok") is True:
        _api_cache_write(cache_key, fresh)
        return {**fresh, "_cache": {"hit": False, "age_s": 0, "stale": False}}

    # No cache and compute failed: return the failure payload as-is.
    return fresh if isinstance(fresh, dict) else {"ok": False, "error": "unknown"}


def read_build_info() -> dict:
    info = _read_json(BUILD_FILE)
    if info:
        return info
    return _read_json(os.path.join(STATE_DIR, "build.json"))


def write_build_info(info: dict) -> None:
    try:
        _write_json_atomic(BUILD_FILE, info)
    except Exception:
        _write_json_atomic(os.path.join(STATE_DIR, "build.json"), info)


def _read_update_config() -> dict:
    cfg = _read_json(UPDATE_CONFIG_FILE)
    return cfg if isinstance(cfg, dict) else {}


def _normalize_update_check_interval_s(v: object) -> int:
    raw = str(v or "").strip()
    if not raw:
        return 3600
    try:
        n = int(float(raw))
    except Exception:
        return 3600
    # Allowed presets: hourly / 6-hourly / daily / monthly
    allowed = {3600, 6 * 3600, 24 * 3600, 30 * 24 * 3600}
    if n in allowed:
        return n
    # nearest
    return min(allowed, key=lambda x: abs(x - n))


def _update_config_effective() -> dict:
    cfg = _read_update_config()
    if not isinstance(cfg, dict):
        cfg = {}
    out = dict(cfg)
    out.setdefault("check_interval_s", 3600)
    out.setdefault("auto_apply", False)
    out.setdefault("dismissed_tag", "")
    out["check_interval_s"] = _normalize_update_check_interval_s(out.get("check_interval_s"))
    out["auto_apply"] = bool(out.get("auto_apply"))
    out["dismissed_tag"] = str(out.get("dismissed_tag") or "").strip()
    return out


def _write_update_config(cfg: dict) -> None:
    _write_json_atomic(UPDATE_CONFIG_FILE, cfg)
    try:
        os.chmod(UPDATE_CONFIG_FILE, 0o600)
    except Exception:
        pass


def _read_update_token_file() -> str:
    path = str(UPDATE_TOKEN_FILE or "").strip()
    if not path or not os.path.isfile(path):
        return ""
    try:
        raw = Path(path).read_text(encoding="utf-8")
    except Exception:
        return ""
    tok = (raw or "").strip()
    if not tok:
        return ""
    tok = tok.splitlines()[0].strip()
    return tok[:4096].strip()


def _write_update_token_file(token: str) -> None:
    path = str(UPDATE_TOKEN_FILE or "").strip()
    if not path:
        return
    os.makedirs(os.path.dirname(path), exist_ok=True)

    tok = str(token or "").strip()
    if not tok:
        try:
            os.remove(path)
        except Exception:
            pass
        return

    tmp = f"{path}.tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(tok)
        f.write("\n")
    os.replace(tmp, path)
    try:
        os.chmod(path, 0o600)
    except Exception:
        pass


def _read_store_config() -> dict:
    cfg = _read_json(STORE_CONFIG_FILE)
    return cfg if isinstance(cfg, dict) else {}


def _write_store_config(cfg: dict) -> None:
    _write_json_atomic(STORE_CONFIG_FILE, cfg)
    try:
        os.chmod(STORE_CONFIG_FILE, 0o600)
    except Exception:
        pass


def _normalize_crlf_inplace(path: str) -> None:
    p = str(path or "").strip()
    if not p:
        return
    try:
        raw = Path(p).read_bytes()
    except Exception:
        return
    if b"\r\n" not in raw:
        return
    try:
        Path(p).write_bytes(raw.replace(b"\r\n", b"\n"))
    except Exception:
        return


def update_repo() -> str:
    return str(UPDATE_REPO or "").strip()


def update_token() -> str:
    tok_file = _read_update_token_file()
    if tok_file:
        return tok_file
    cfg = _read_update_config()
    tok = str(cfg.get("token") or cfg.get("github_token") or "").strip()
    if tok:
        return tok
    return str(UPDATE_TOKEN_ENV or "").strip()


_CUSTOM_STORE_PREFIX = "custom"
_CUSTOM_STORE_SLOT_RE = re.compile(r"^custom[-_a-z0-9]{0,48}$")


def _is_custom_store_slot(slot: str) -> bool:
    key = str(slot or "").strip().lower()
    if not key:
        return False
    if not key.startswith(_CUSTOM_STORE_PREFIX):
        return False
    return bool(_CUSTOM_STORE_SLOT_RE.match(key))


def store_config_get() -> dict:
    cfg = _read_store_config()
    custom = cfg.get("custom") if isinstance(cfg, dict) else {}
    if not isinstance(custom, dict):
        custom = {}
    out: dict[str, dict] = {}
    for slot, entry in custom.items():
        slot = str(slot or "").strip().lower()
        if not _is_custom_store_slot(slot):
            continue
        if not isinstance(entry, dict):
            continue
        url = str(entry.get("url") or "").strip()
        if not url:
            continue
        label = str(entry.get("label") or "").strip()
        out[slot] = {"url": url, "label": label}
    return {
        "ok": True,
        "custom": out,
        "main_repo": STORE_MAIN_REPO,
        "main_branch": STORE_MAIN_BRANCH,
        "dev_repo": STORE_DEV_REPO,
        "dev_branch": STORE_DEV_BRANCH,
    }


def _normalize_store_url(url: str) -> str:
    raw = str(url or "").strip()
    if not raw:
        return ""
    if raw.startswith("http://") or raw.startswith("https://"):
        return raw
    if raw.startswith("github.com/"):
        return f"https://{raw}"
    return raw


def store_config_set(body: dict) -> dict:
    if not isinstance(body, dict):
        return {"ok": False, "error": "invalid body"}

    cfg = _read_store_config()
    custom = cfg.get("custom") if isinstance(cfg, dict) else {}
    if not isinstance(custom, dict):
        custom = {}

    slot = str(body.get("slot") or "").strip().lower()
    if slot and not _is_custom_store_slot(slot):
        return {"ok": False, "error": f"invalid slot: {slot}"}

    url = _normalize_store_url(body.get("url") or "")
    label = str(body.get("label") or "").strip()

    if slot:
        if url:
            if not (url.startswith("http://") or url.startswith("https://")):
                return {"ok": False, "error": "url must start with http:// or https://"}
            custom[slot] = {"url": url, "label": label}
        else:
            custom.pop(slot, None)
    elif "custom" in body and isinstance(body.get("custom"), dict):
        for key, entry in body.get("custom", {}).items():
            key = str(key or "").strip().lower()
            if not _is_custom_store_slot(key):
                continue
            if not isinstance(entry, dict):
                continue
            entry_url = _normalize_store_url(entry.get("url") or "")
            entry_label = str(entry.get("label") or "").strip()
            if entry_url:
                if not (entry_url.startswith("http://") or entry_url.startswith("https://")):
                    continue
                custom[key] = {"url": entry_url, "label": entry_label}
            else:
                custom.pop(key, None)

    cfg["custom"] = custom
    _write_store_config(cfg)
    return {**store_config_get(), "saved": True}


def _https_defaults() -> dict:
    return {"enabled": False}


def _read_https_config() -> dict:
    cfg = _read_json(HTTPS_CONFIG_FILE)
    return cfg if isinstance(cfg, dict) else {}


def _write_https_config(cfg: dict) -> None:
    _write_json_atomic(HTTPS_CONFIG_FILE, cfg if isinstance(cfg, dict) else {})
    try:
        os.chmod(HTTPS_CONFIG_FILE, 0o600)
    except Exception:
        pass


def _https_paths() -> tuple[Path, Path, Path]:
    overlay_dir = Path(ROOT_DIR) / "overlay"
    ssl_conf = overlay_dir / "nginx" / "ssl.conf"
    tls_dir = overlay_dir / "nginx" / "tls"
    compose_dir = overlay_dir
    return ssl_conf, tls_dir, compose_dir


def _apply_https_config(*, enabled: bool, regenerate: bool = False) -> dict:
    ssl_conf, tls_dir, compose_dir = _https_paths()
    tls_dir.mkdir(parents=True, exist_ok=True)

    cert_path = tls_dir / "portal.crt"
    key_path = tls_dir / "portal.key"

    if enabled:
        if not _which("openssl"):
            return {"ok": False, "error": "openssl not installed (required for self-signed HTTPS)"}
        if regenerate or (not cert_path.is_file()) or (not key_path.is_file()):
            subj = "/CN=5tratumos"
            proc = run_cmd(
                [
                    "openssl",
                    "req",
                    "-x509",
                    "-nodes",
                    "-newkey",
                    "rsa:2048",
                    "-keyout",
                    str(key_path),
                    "-out",
                    str(cert_path),
                    "-days",
                    "3650",
                    "-subj",
                    subj,
                ],
                timeout_s=90,
            )
            if proc.returncode != 0:
                return {"ok": False, "error": (proc.stderr or proc.stdout or "openssl failed").strip()}
            try:
                os.chmod(key_path, 0o600)
                os.chmod(cert_path, 0o644)
            except Exception:
                pass
        ssl_conf.write_text(
            "\n".join(
                [
                    "# Autogenerated by 5tratumOS",
                    "listen 443 ssl;",
                    "ssl_certificate /etc/nginx/tls/portal.crt;",
                    "ssl_certificate_key /etc/nginx/tls/portal.key;",
                    "ssl_protocols TLSv1.2 TLSv1.3;",
                    "ssl_session_cache shared:SSL:10m;",
                    "ssl_session_timeout 10m;",
                    "",
                ]
            ),
            encoding="utf-8",
        )
    else:
        ssl_conf.write_text(
            "\n".join(
                [
                    "# HTTPS disabled",
                    "# 5tratumOS will overwrite this file when HTTPS is enabled.",
                    "",
                ]
            ),
            encoding="utf-8",
        )

    proc = run_cmd(
        ["docker", "compose", "--project-name", "5tratumos-overlay", "restart", "portal"],
        cwd=str(compose_dir),
        timeout_s=180,
    )
    ok = proc.returncode == 0
    return {
        "ok": ok,
        "enabled": bool(enabled),
        "cert_present": bool(cert_path.is_file() and key_path.is_file()),
        "restart": {"ok": ok, "code": proc.returncode, "stdout": proc.stdout, "stderr": proc.stderr},
    }


def https_config_get() -> dict:
    cfg = _https_defaults()
    raw = _read_https_config()
    if isinstance(raw, dict):
        cfg["enabled"] = bool(raw.get("enabled"))
    ssl_conf, tls_dir, _compose_dir = _https_paths()
    return {
        "ok": True,
        "config": cfg,
        "cert_present": bool((tls_dir / "portal.crt").is_file() and (tls_dir / "portal.key").is_file()),
        "ssl_conf_present": bool(ssl_conf.is_file()),
    }


def https_config_set(body: dict) -> dict:
    if not isinstance(body, dict):
        return {"ok": False, "error": "invalid body"}
    enabled = bool(body.get("enabled")) if "enabled" in body else None
    regen = bool(body.get("regenerate")) if "regenerate" in body else False
    cfg = _https_defaults()
    raw = _read_https_config()
    if isinstance(raw, dict):
        cfg.update({k: raw.get(k) for k in cfg.keys()})
    if enabled is not None:
        cfg["enabled"] = bool(enabled)
    _write_https_config(cfg)
    apply_res = _apply_https_config(enabled=bool(cfg.get("enabled")), regenerate=regen)
    return {**https_config_get(), "applied": apply_res}


def store_custom_channels() -> list[str]:
    cfg = store_config_get()
    custom = cfg.get("custom") if isinstance(cfg, dict) else {}
    if not isinstance(custom, dict):
        return []
    out = []
    for slot in custom.keys():
        key = str(slot or "").strip().lower()
        if _is_custom_store_slot(key):
            out.append(key)
    out.sort()
    return out


def allowed_store_channels() -> set[str]:
    return {"main", "dev", "global", *store_custom_channels()}


def _read_session_config() -> dict:
    cfg = _read_json(SESSION_CONFIG_FILE)
    return cfg if isinstance(cfg, dict) else {}


def _write_session_config(cfg: dict) -> None:
    _write_json_atomic(SESSION_CONFIG_FILE, cfg)
    try:
        os.chmod(SESSION_CONFIG_FILE, 0o600)
    except Exception:
        pass


def system_session_config_get() -> dict:
    cfg = _read_session_config()
    try:
        lock_minutes = int(str(cfg.get("lock_minutes") or "0").strip() or "0")
    except Exception:
        lock_minutes = 0
    lock_minutes = max(0, lock_minutes)
    return {"ok": True, "lock_minutes": lock_minutes}


def system_session_config_set(body: dict) -> dict:
    if not isinstance(body, dict):
        return {"ok": False, "error": "invalid body"}

    cfg = _read_session_config()
    if "lock_minutes" in body or "autolock_minutes" in body:
        raw = body.get("lock_minutes") if "lock_minutes" in body else body.get("autolock_minutes")
        try:
            minutes = int(str(raw).strip() or "0")
        except Exception:
            return {"ok": False, "error": "lock_minutes must be an integer"}
        minutes = max(0, minutes)
        # Hard cap to 7 days to avoid accidental giant numbers.
        if minutes > 60 * 24 * 7:
            return {"ok": False, "error": "lock_minutes too large"}
        cfg["lock_minutes"] = minutes

    _write_session_config(cfg)
    return {**system_session_config_get(), "saved": True}


def _read_ui_config() -> dict:
    cfg = _read_json(UI_CONFIG_FILE)
    return cfg if isinstance(cfg, dict) else {}


def _write_ui_config(cfg: dict) -> None:
    _write_json_atomic(UI_CONFIG_FILE, cfg)
    try:
        os.chmod(UI_CONFIG_FILE, 0o600)
    except Exception:
        pass


def system_ui_config_get() -> dict:
    cfg = _read_ui_config()
    mode = str(cfg.get("workbench_topbar_mode") or "").strip().lower() or "compact"
    if mode not in {"expanded", "compact", "auto"}:
        mode = "compact"

    topbar_mode_raw = str(cfg.get("topbar_mode") or "").strip().lower()
    topbar_mode: str | None = None
    if topbar_mode_raw in {"static", "collapsed", "auto", "manual"}:
        topbar_mode = topbar_mode_raw

    pinned_raw = cfg.get("topbar_pinned")
    pinned: bool | None = None
    if pinned_raw is not None:
        if isinstance(pinned_raw, bool):
            pinned = pinned_raw
        else:
            sval = str(pinned_raw).strip().lower()
            if sval in {"1", "true", "yes", "y", "on", "pinned"}:
                pinned = True
            elif sval in {"0", "false", "no", "n", "off", "autohide", "auto", "unpinned"}:
                pinned = False

    # Migration path:
    # - If topbar_pinned is not set but workbench_topbar_mode is explicitly set, infer pinned from it
    #   to preserve existing behavior.
    # - Otherwise default to pinned (expanded) globally.
    if pinned is None:
        pinned = mode == "expanded" if "workbench_topbar_mode" in cfg else True

    # If explicit topbar_mode is missing, derive from pinned for backwards compatibility.
    if topbar_mode is None:
        topbar_mode = "static" if pinned else "auto"

    # Keep pinned consistent with explicit mode.
    pinned = topbar_mode == "static"

    return {"ok": True, "workbench_topbar_mode": mode, "topbar_pinned": pinned, "topbar_mode": topbar_mode}


def system_ui_config_set(body: dict) -> dict:
    if not isinstance(body, dict):
        return {"ok": False, "error": "invalid body"}

    cfg = _read_ui_config()
    if "workbench_topbar_mode" in body or "topbar_workbench" in body:
        raw = body.get("workbench_topbar_mode") if "workbench_topbar_mode" in body else body.get("topbar_workbench")
        mode = str(raw or "").strip().lower()
        if mode not in {"expanded", "compact", "auto"}:
            return {"ok": False, "error": "workbench_topbar_mode must be expanded, compact, or auto"}
        cfg["workbench_topbar_mode"] = mode

    if "topbar_pinned" in body or "topbarPinned" in body:
        raw = body.get("topbar_pinned") if "topbar_pinned" in body else body.get("topbarPinned")
        pinned: bool | None = None
        if isinstance(raw, bool):
            pinned = raw
        else:
            sval = str(raw).strip().lower()
            if sval in {"1", "true", "yes", "y", "on", "pinned"}:
                pinned = True
            elif sval in {"0", "false", "no", "n", "off", "autohide", "auto", "unpinned"}:
                pinned = False
        if pinned is None:
            return {"ok": False, "error": "topbar_pinned must be true/false"}
        cfg["topbar_pinned"] = pinned

    if "topbar_mode" in body or "topbarMode" in body:
        raw = body.get("topbar_mode") if "topbar_mode" in body else body.get("topbarMode")
        mode = str(raw or "").strip().lower()
        if mode not in {"static", "collapsed", "auto", "manual"}:
            return {"ok": False, "error": "topbar_mode must be static, collapsed, auto, or manual"}
        cfg["topbar_mode"] = mode
        # Keep pinned coherent with mode for old clients.
        cfg["topbar_pinned"] = mode == "static"

    _write_ui_config(cfg)
    return {**system_ui_config_get(), "saved": True}


def _read_desktop_state() -> dict:
    cfg = _read_json(DESKTOP_STATE_FILE)
    return cfg if isinstance(cfg, dict) else {}


def _write_desktop_state(state: dict) -> None:
    _write_json_atomic(DESKTOP_STATE_FILE, state if isinstance(state, dict) else {})
    try:
        os.chmod(DESKTOP_STATE_FILE, 0o600)
    except Exception:
        pass


def desktop_state_get() -> dict:
    return {"ok": True, "state": _read_desktop_state()}


def desktop_state_set(body: dict) -> dict:
    if not isinstance(body, dict):
        return {"ok": False, "error": "invalid body"}
    state = body.get("state") if "state" in body else body
    if not isinstance(state, dict):
        return {"ok": False, "error": "state must be an object"}
    items = state.get("items")
    if items is not None and not isinstance(items, dict):
        return {"ok": False, "error": "state.items must be an object"}
    _write_desktop_state(state)
    return {"ok": True, "saved": True, "state": _read_desktop_state()}


def _read_apps_pages_state() -> dict:
    cfg = _read_json(APPS_PAGES_FILE)
    return cfg if isinstance(cfg, dict) else {}


def _write_apps_pages_state(state: dict) -> None:
    _write_json_atomic(APPS_PAGES_FILE, state if isinstance(state, dict) else {})
    try:
        os.chmod(APPS_PAGES_FILE, 0o600)
    except Exception:
        pass


def apps_pages_get() -> dict:
    return {"ok": True, "state": _read_apps_pages_state()}


def apps_pages_set(body: dict) -> dict:
    if not isinstance(body, dict):
        return {"ok": False, "error": "invalid body"}
    state = body.get("state") if "state" in body else body
    if not isinstance(state, dict):
        return {"ok": False, "error": "state must be an object"}
    pages = state.get("pages")
    if pages is not None and not isinstance(pages, list):
        return {"ok": False, "error": "state.pages must be a list"}
    active = state.get("active")
    if active is not None and not isinstance(active, str):
        return {"ok": False, "error": "state.active must be a string"}
    _write_apps_pages_state(state)
    return {"ok": True, "saved": True, "state": _read_apps_pages_state()}


def _storage_defaults() -> dict:
    return {
        # When empty, use the local state dir (/var/lib/5tratumos).
        "default_mount": "",
        # Explicitly registered mountpoints (disks formatted/mounted externally are fine too).
        # Each item: { "mountpoint": "/srv/5tratumos-data", "label": "Internal" }
        "mounts": [],
    }


def _normalize_mountpoint(mp: str) -> str:
    p = str(mp or "").strip()
    if not p:
        return ""
    if not p.startswith("/"):
        return ""
    return p.rstrip("/") or "/"


def storage_config_get() -> dict:
    cfg = _read_json(STORAGE_CONFIG_FILE)
    base = _storage_defaults()
    if isinstance(cfg, dict):
        base.update(cfg)
    default_mount = _normalize_mountpoint(str(base.get("default_mount") or ""))
    mounts = []
    raw_mounts = base.get("mounts")
    if isinstance(raw_mounts, list):
        for item in raw_mounts:
            if not isinstance(item, dict):
                continue
            mp = _normalize_mountpoint(str(item.get("mountpoint") or ""))
            if not mp:
                continue
            mounts.append(
                {
                    "mountpoint": mp,
                    "label": str(item.get("label") or "").strip(),
                }
            )
    # Always include the main data dir mountpoint if present.
    data_mp = _normalize_mountpoint(DATA_DIR)
    if data_mp and all(m.get("mountpoint") != data_mp for m in mounts):
        mounts.append({"mountpoint": data_mp, "label": "Internal"})
    # De-dupe
    dedup: dict[str, dict] = {}
    for m in mounts:
        mp = str(m.get("mountpoint") or "")
        if mp:
            dedup[mp] = m
    mounts = list(dedup.values())
    mounts.sort(key=lambda it: it.get("mountpoint") or "")

    base["default_mount"] = default_mount
    base["mounts"] = mounts
    return {"ok": True, "config": base}


def storage_config_set(body: dict) -> dict:
    if not isinstance(body, dict):
        return {"ok": False, "error": "invalid body"}
    cfg = storage_config_get().get("config") if isinstance(storage_config_get(), dict) else _storage_defaults()
    cfg = cfg if isinstance(cfg, dict) else _storage_defaults()

    if "default_mount" in body:
        cfg["default_mount"] = _normalize_mountpoint(str(body.get("default_mount") or ""))
    if "mounts" in body and isinstance(body.get("mounts"), list):
        cleaned = []
        for item in body.get("mounts") or []:
            if not isinstance(item, dict):
                continue
            mp = _normalize_mountpoint(str(item.get("mountpoint") or ""))
            if not mp:
                continue
            cleaned.append({"mountpoint": mp, "label": str(item.get("label") or "").strip()})
        cfg["mounts"] = cleaned

    _write_json_atomic(STORAGE_CONFIG_FILE, cfg)
    try:
        os.chmod(STORAGE_CONFIG_FILE, 0o600)
    except Exception:
        pass
    return {"ok": True, "saved": True, "config": storage_config_get().get("config")}


def _lsblk_json() -> dict:
    proc = run_cmd(
        [
            "lsblk",
            "-J",
            "-o",
            "NAME,KNAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,LABEL,MODEL,RM,ROTA",
        ],
        timeout_s=6,
    )
    if proc.returncode != 0:
        return {}
    try:
        obj = json.loads(proc.stdout or "{}")
    except Exception:
        return {}
    return obj if isinstance(obj, dict) else {}


def _flatten_lsblk(node: dict, out: list[dict]) -> None:
    if not isinstance(node, dict):
        return
    out.append(node)
    children = node.get("children")
    if isinstance(children, list):
        for c in children:
            if isinstance(c, dict):
                _flatten_lsblk(c, out)


def system_storage_status() -> dict:
    cfg = storage_config_get().get("config") if isinstance(storage_config_get(), dict) else _storage_defaults()
    cfg = cfg if isinstance(cfg, dict) else _storage_defaults()
    registered = cfg.get("mounts") if isinstance(cfg.get("mounts"), list) else []
    reg_set = {str(m.get("mountpoint") or "") for m in registered if isinstance(m, dict)}
    label_by_mp = {
        str(m.get("mountpoint") or ""): str(m.get("label") or "").strip()
        for m in registered
        if isinstance(m, dict) and str(m.get("mountpoint") or "")
    }

    devices: list[dict] = []
    mounts: list[dict] = []
    lsblk = _lsblk_json()
    blockdevices = lsblk.get("blockdevices") if isinstance(lsblk, dict) else None
    flat: list[dict] = []
    if isinstance(blockdevices, list):
        for bd in blockdevices:
            if isinstance(bd, dict):
                _flatten_lsblk(bd, flat)
    for entry in flat:
        tp = str(entry.get("type") or "")
        name = str(entry.get("name") or "")
        kname = str(entry.get("kname") or name)
        mp = str(entry.get("mountpoint") or "").strip()
        fstype = str(entry.get("fstype") or "").strip()
        uuid = str(entry.get("uuid") or "").strip()
        label = str(entry.get("label") or "").strip()
        size = str(entry.get("size") or "").strip()
        model = str(entry.get("model") or "").strip()
        rm = bool(entry.get("rm")) if "rm" in entry else False
        rota = bool(entry.get("rota")) if "rota" in entry else False
        path = f"/dev/{kname}" if kname else ""
        if tp in {"disk", "part"}:
            devices.append(
                {
                    "type": tp,
                    "name": name,
                    "path": path,
                    "size": size,
                    "fstype": fstype,
                    "uuid": uuid,
                    "label": label,
                    "model": model,
                    "removable": rm,
                    "rotational": rota,
                    "mountpoint": mp,
                }
            )
        if mp:
            marker = os.path.isdir(os.path.join(mp, "5tratumos")) or os.path.isdir(os.path.join(mp, "5tratumos", "apps"))
            cfg_label = label_by_mp.get(mp) or ""
            mounts.append(
                {
                    "mountpoint": mp,
                    "fstype": fstype,
                    "uuid": uuid,
                    "label": cfg_label or label,
                    "config_label": cfg_label,
                    "size": size,
                    "registered": mp in reg_set,
                    "has_5tratumos": bool(marker),
                }
            )
    # De-dupe mountpoints
    mounts_by_mp: dict[str, dict] = {}
    for m in mounts:
        mounts_by_mp[str(m.get("mountpoint") or "")] = m
    mounts = sorted(mounts_by_mp.values(), key=lambda it: it.get("mountpoint") or "")
    return {"ok": True, "config": cfg, "mounts": mounts, "devices": devices}


def _ensure_network_manager() -> dict:
    """
    Ensure NetworkManager + nmcli exist. Returns {ok, installed, error}.
    """
    if _which("nmcli"):
        return {"ok": True, "installed": True}
    install_cmd = ["/usr/bin/apt-get", "install", "-y", "network-manager"]
    update_cmd = ["/usr/bin/apt-get", "update"]

    proc = run_cmd(install_cmd, timeout_s=600)
    if proc.returncode != 0:
        upd = run_cmd(update_cmd, timeout_s=300)
        if upd.returncode != 0:
            return {"ok": False, "installed": False, "error": (upd.stderr or upd.stdout or "apt update failed").strip()}
        proc = run_cmd(install_cmd, timeout_s=600)
        if proc.returncode != 0:
            return {"ok": False, "installed": False, "error": (proc.stderr or proc.stdout or "install failed").strip()}

    run_cmd(["/bin/systemctl", "enable", "--now", "NetworkManager.service"], timeout_s=60)
    return {"ok": True, "installed": True}


def _nmcli(args: list[str], *, timeout_s: int = 20) -> subprocess.CompletedProcess:
    return run_cmd(["nmcli", *args], timeout_s=timeout_s)


def _wifi_device() -> str:
    proc = _nmcli(["-t", "--separator", "\t", "-f", "DEVICE,TYPE,STATE", "device", "status"], timeout_s=8)
    if proc.returncode != 0:
        return ""
    for ln in (proc.stdout or "").splitlines():
        parts = ln.split("\t")
        if len(parts) < 2:
            continue
        dev = (parts[0] or "").strip()
        typ = (parts[1] or "").strip()
        if typ == "wifi":
            return dev
    return ""


def system_wifi_status() -> dict:
    nm = _ensure_network_manager()
    if not nm.get("ok"):
        return {"ok": False, "error": nm.get("error") or "NetworkManager not available"}

    enabled = False
    proc = _nmcli(["-t", "-f", "WIFI", "general"], timeout_s=5)
    if proc.returncode == 0:
        enabled = "enabled" in (proc.stdout or "").strip().lower()

    dev = _wifi_device()
    connected = False
    ssid = ""
    if dev:
        proc = _nmcli(["-t", "--separator", "\t", "-f", "GENERAL.STATE,GENERAL.CONNECTION", "device", "show", dev], timeout_s=6)
        if proc.returncode == 0:
            state = ""
            conn = ""
            for ln in (proc.stdout or "").splitlines():
                k, _, v = ln.partition("\t")
                if k == "GENERAL.STATE":
                    state = str(v).strip()
                elif k == "GENERAL.CONNECTION":
                    conn = str(v).strip()
            connected = state.startswith("100") or state.lower().startswith("connected")
            ssid = conn if conn and conn != "--" else ""

    return {"ok": True, "enabled": enabled, "device": dev, "connected": connected, "ssid": ssid}


def system_wifi_scan() -> dict:
    nm = _ensure_network_manager()
    if not nm.get("ok"):
        return {"ok": False, "error": nm.get("error") or "NetworkManager not available"}

    dev = _wifi_device()
    if not dev:
        return {"ok": False, "error": "no wifi device detected"}

    proc = _nmcli(
        ["-t", "--separator", "\t", "-f", "IN-USE,SSID,SECURITY,SIGNAL", "device", "wifi", "list", "--rescan", "yes"],
        timeout_s=20,
    )
    if proc.returncode != 0:
        return {"ok": False, "error": (proc.stderr or proc.stdout or "scan failed").strip()}

    nets: list[dict] = []
    seen: set[str] = set()
    for ln in (proc.stdout or "").splitlines():
        parts = ln.split("\t")
        if len(parts) < 4:
            continue
        in_use, ssid, sec, sig = parts[0], parts[1], parts[2], parts[3]
        ssid = str(ssid or "").strip()
        sec = str(sec or "").strip()
        key = f"{ssid}\n{sec}"
        if key in seen:
            continue
        seen.add(key)
        try:
            signal = int(str(sig or "").strip() or "0")
        except Exception:
            signal = 0
        nets.append({"ssid": ssid, "security": sec, "signal": signal, "in_use": str(in_use or "").strip() == "*"})

    nets.sort(key=lambda x: (0 if x.get("in_use") else 1, -(int(x.get("signal") or 0)), str(x.get("ssid") or "")))
    return {"ok": True, "device": dev, "networks": nets}


def system_wifi_toggle(body: dict) -> dict:
    nm = _ensure_network_manager()
    if not nm.get("ok"):
        return {"ok": False, "error": nm.get("error") or "NetworkManager not available"}
    enabled = bool(body.get("enabled")) if isinstance(body, dict) else False
    proc = _nmcli(["radio", "wifi", "on" if enabled else "off"], timeout_s=10)
    if proc.returncode != 0:
        return {"ok": False, "error": (proc.stderr or proc.stdout or "toggle failed").strip()}
    return {"ok": True, "enabled": enabled}


def system_wifi_disconnect() -> dict:
    nm = _ensure_network_manager()
    if not nm.get("ok"):
        return {"ok": False, "error": nm.get("error") or "NetworkManager not available"}
    dev = _wifi_device()
    if not dev:
        return {"ok": False, "error": "no wifi device detected"}
    proc = _nmcli(["device", "disconnect", dev], timeout_s=20)
    if proc.returncode != 0:
        return {"ok": False, "error": (proc.stderr or proc.stdout or "disconnect failed").strip()}
    return {"ok": True}


def system_wifi_connect(body: dict) -> dict:
    nm = _ensure_network_manager()
    if not nm.get("ok"):
        return {"ok": False, "error": nm.get("error") or "NetworkManager not available"}
    if not isinstance(body, dict):
        return {"ok": False, "error": "invalid body"}
    ssid = str(body.get("ssid") or "").strip()
    password = str(body.get("password") or "").strip()
    hidden = bool(body.get("hidden"))
    if not ssid:
        return {"ok": False, "error": "missing ssid"}
    dev = _wifi_device()
    if not dev:
        return {"ok": False, "error": "no wifi device detected"}

    args = ["device", "wifi", "connect", ssid]
    if password:
        args += ["password", password]
    if hidden:
        args += ["hidden", "yes"]
    proc = _nmcli(args, timeout_s=60)
    if proc.returncode != 0:
        return {"ok": False, "error": (proc.stderr or proc.stdout or "connect failed").strip()}
    return {"ok": True}


_MIGRATE_LOCK = threading.Lock()


def _app_state_dir(app_id: str) -> str:
    return os.path.join(STATE_DIR, "apps", app_id)


def _app_state_target(app_id: str) -> tuple[str, bool]:
    p = _app_state_dir(app_id)
    if os.path.islink(p):
        try:
            return os.path.realpath(p), True
        except Exception:
            return p, True
    return p, False


def _migrate_status_path(app_id: str) -> str:
    safe = re.sub(r"[^a-z0-9_-]+", "", (app_id or "").strip().lower())
    return os.path.join(STATE_DIR, "storage", "migrate", f"{safe}.json")


def migrate_status_read(app_id: str) -> dict:
    return _read_json(_migrate_status_path(app_id))


def migrate_status_write(app_id: str, state: str, *, pct: int | None = None, **extra: object) -> None:
    obj = {"ok": True, "app_id": app_id, "state": state, "time": _now_iso()}
    if pct is not None:
        obj["pct"] = max(0, min(100, int(pct)))
    for k, v in extra.items():
        obj[k] = v
    _write_json_atomic(_migrate_status_path(app_id), obj)

def _human_bytes(n: int | None) -> str:
    if n is None:
        return "-"
    try:
        v = int(n)
    except Exception:
        return "-"
    if v < 0:
        return "-"
    units = ["B", "KB", "MB", "GB", "TB", "PB"]
    f = float(v)
    idx = 0
    while f >= 1024.0 and idx < len(units) - 1:
        f /= 1024.0
        idx += 1
    if idx == 0:
        return f"{int(f)} {units[idx]}"
    return f"{f:.2f} {units[idx]}"


def _storage_app_roots() -> list[tuple[str, str, str]]:
    """
    Return [(root_path, mountpoint, label)] for all 5tratumOS app-data roots.
    - Local: STATE_DIR/apps
    - External: <mp>/5tratumos/apps for detected + registered mounts
    """
    roots: list[tuple[str, str, str]] = []
    roots.append((os.path.join(STATE_DIR, "apps"), "", "OS disk (system)"))
    # Also include the default internal data dir if present (even if not registered yet).
    try:
        roots.append((os.path.join(DATA_DIR, "5tratumos", "apps"), DATA_DIR, "Internal"))
    except Exception:
        pass
    try:
        st = system_storage_status()
    except Exception:
        st = {}
    mounts = st.get("mounts") if isinstance(st, dict) else None
    if isinstance(mounts, list):
        for m in mounts:
            if not isinstance(m, dict):
                continue
            mp = str(m.get("mountpoint") or "").strip()
            if not mp:
                continue
            if not (bool(m.get("registered")) or bool(m.get("has_5tratumos"))):
                continue
            label = str(m.get("label") or "").strip() or "External drive"
            roots.append((os.path.join(mp, "5tratumos", "apps"), mp, label))
    # Opportunistically discover any mounts that already contain a 5tratumos/apps tree.
    # This makes orphan scanning + cleanup work even if a drive isn't registered yet.
    try:
        seen_mps: set[str] = set()
        for _root, mp, _label in roots:
            if mp:
                seen_mps.add(mp)
        with open("/proc/mounts", "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                parts = line.split()
                if len(parts) < 3:
                    continue
                mp = parts[1]
                fstype = parts[2]
                if not mp or mp in seen_mps:
                    continue
                if fstype in {"proc", "sysfs", "devtmpfs", "devpts", "tmpfs", "cgroup2", "overlay"}:
                    continue
                probe = os.path.join(mp, "5tratumos", "apps")
                if os.path.isdir(probe):
                    roots.append((probe, mp, "External drive"))
                    seen_mps.add(mp)
    except Exception:
        pass
    # De-dupe by real path.
    seen: set[str] = set()
    out: list[tuple[str, str, str]] = []
    for root, mp, label in roots:
        try:
            rp = os.path.realpath(root)
        except Exception:
            rp = root
        if rp in seen:
            continue
        seen.add(rp)
        out.append((root, mp, label))
    return out


def _is_under_dir(path: str, root: str) -> bool:
    try:
        rp = os.path.realpath(path)
        rr = os.path.realpath(root)
    except Exception:
        rp = path
        rr = root
    if rp == rr:
        return True
    return rp.startswith(rr.rstrip(os.sep) + os.sep)


def _safe_delete_any(path: str, allowed_roots: list[str]) -> tuple[bool, str]:
    p = str(path or "").strip()
    if not p:
        return False, "missing path"
    if not os.path.exists(p) and not os.path.islink(p):
        return True, ""
    if not any(_is_under_dir(p, root) for root in allowed_roots):
        return False, "refusing to delete outside app storage roots"
    if any(os.path.realpath(p) == os.path.realpath(root) for root in allowed_roots):
        return False, "refusing to delete storage root"
    try:
        if os.path.islink(p):
            os.unlink(p)
            return True, ""
        if os.path.isdir(p):
            shutil.rmtree(p)
            return True, ""
        os.remove(p)
        return True, ""
    except Exception as e:
        return False, str(e)


def app_migrate_data(app_id: str, mountpoint: str | None, *, keep_backup: bool = False) -> dict:
    aid = str(app_id or "").strip().lower()
    if not aid:
        return {"ok": False, "error": "missing app id"}
    if not os.path.isdir(os.path.join(APPS_DIR, aid)):
        return {"ok": False, "error": "app not installed"}

    mp = _normalize_mountpoint(str(mountpoint or ""))
    cfg = storage_config_get().get("config") if isinstance(storage_config_get(), dict) else _storage_defaults()
    cfg = cfg if isinstance(cfg, dict) else _storage_defaults()
    reg = cfg.get("mounts") if isinstance(cfg.get("mounts"), list) else []
    reg_set = {str(m.get("mountpoint") or "") for m in reg if isinstance(m, dict)}
    if mp and mp not in reg_set:
        return {"ok": False, "error": "mountpoint not registered"}

    with _MIGRATE_LOCK:
        st = migrate_status_read(aid)
        if str(st.get("state") or "").strip().lower() in {"stopping", "copying", "switching", "starting"}:
            return {"ok": False, "error": "migration already in progress"}

        def worker() -> None:
            try:
                src_real, src_is_link = _app_state_target(aid)
                src_path = _app_state_dir(aid)
                os.makedirs(os.path.dirname(src_path), exist_ok=True)
                allowed_roots = [r for (r, _mp, _label) in _storage_app_roots()]

                if mp:
                    dest_root = os.path.join(mp, "5tratumos", "apps")
                    dest_path = os.path.join(dest_root, aid)
                else:
                    dest_root = os.path.join(STATE_DIR, "apps")
                    dest_path = os.path.join(dest_root, aid)
                # Always allow cleaning the specific source and destination roots involved in this migration,
                # even if the drive isn't registered yet (prevents stale data from blocking future moves).
                try:
                    allowed_roots.append(dest_root)
                except Exception:
                    pass
                try:
                    allowed_roots.append(os.path.dirname(src_real))
                except Exception:
                    pass

                migrate_status_write(aid, "stopping", pct=10, from_path=src_real, to_path=dest_path)
                stratumos_cmd(["app", "down", aid], timeout_s=600)

                # If moving back to local storage from a symlinked app dir, the destination
                # path equals src_path (currently a symlink). Handle as a special case.
                moving_to_local = not mp
                if moving_to_local and src_is_link:
                    ts = int(time.time())
                    tmp_path = f"{src_path}.migrating.{ts}"
                    if os.path.exists(tmp_path):
                        migrate_status_write(aid, "error", error="stale migration directory exists", pct=100)
                        return
                    migrate_status_write(aid, "copying", pct=45)
                    os.makedirs(os.path.dirname(tmp_path), exist_ok=True)
                    os.makedirs(tmp_path, exist_ok=True)
                    proc = run_cmd(["cp", "-a", os.path.join(src_real, "."), tmp_path], timeout_s=3600)
                    if proc.returncode != 0:
                        migrate_status_write(aid, "error", error=(proc.stderr or proc.stdout or "copy failed").strip(), pct=100)
                        return
                    migrate_status_write(aid, "switching", pct=75)
                    try:
                        os.unlink(src_path)
                    except Exception as e:
                        migrate_status_write(aid, "error", error=f"unlink failed: {e}", pct=100)
                        return
                    try:
                        os.rename(tmp_path, src_path)
                    except Exception as e:
                        migrate_status_write(aid, "error", error=f"rename failed: {e}", pct=100)
                        return
                    migrate_status_write(aid, "starting", pct=90)
                    stratumos_cmd(["app", "up", aid], timeout_s=600)
                    cleanup_ok = True
                    cleanup_error = ""
                    if not keep_backup:
                        migrate_status_write(aid, "cleaning", pct=95)
                        cleanup_ok, cleanup_error = _safe_delete_any(src_real, allowed_roots)
                    migrate_status_write(
                        aid,
                        "done",
                        pct=100,
                        mountpoint="",
                        cleaned=bool(not keep_backup),
                        cleanup_ok=cleanup_ok,
                        cleanup_error=cleanup_error,
                    )
                    return
                if moving_to_local and not src_is_link:
                    # Already local (no-op).
                    migrate_status_write(aid, "starting", pct=90)
                    stratumos_cmd(["app", "up", aid], timeout_s=600)
                    migrate_status_write(aid, "done", pct=100, mountpoint="")
                    return

                # Moving to an external/internal mountpoint.
                if os.path.exists(dest_path):
                    # If destination already contains the same data, treat as no-op.
                    try:
                        if os.path.realpath(dest_path) == os.path.realpath(src_real):
                            migrate_status_write(aid, "done", pct=100, mountpoint=mp or "")
                            stratumos_cmd(["app", "up", aid], timeout_s=600)
                            return
                    except Exception:
                        pass
                    # If the user opted to not keep backups, try to clean up the stale destination folder
                    # so a re-migration doesn't get stuck.
                    if not keep_backup:
                        ok, err = _safe_delete_any(dest_path, allowed_roots)
                        if ok:
                            try:
                                os.makedirs(dest_root, exist_ok=True)
                            except Exception:
                                pass
                        else:
                            migrate_status_write(aid, "error", error=f"destination already exists ({err})", pct=100)
                            return
                    else:
                        migrate_status_write(aid, "error", error="destination already exists", pct=100)
                        return

                os.makedirs(dest_root, exist_ok=True)
                os.makedirs(dest_path, exist_ok=True)
                migrate_status_write(aid, "copying", pct=45)
                # Prefer cp -a for speed/preservation; fall back to python if needed.
                proc = run_cmd(["cp", "-a", os.path.join(src_real, "."), dest_path], timeout_s=3600)
                if proc.returncode != 0:
                    migrate_status_write(aid, "error", error=(proc.stderr or proc.stdout or "copy failed").strip(), pct=100)
                    return

                migrate_status_write(aid, "switching", pct=75)
                ts = int(time.time())
                backup_path = ""
                if os.path.islink(src_path):
                    try:
                        os.unlink(src_path)
                    except Exception:
                        pass
                else:
                    # For safety, keep a local backup unless the user opts out.
                    try:
                        backup_path = f"{src_path}.bak.{ts}"
                        os.rename(src_path, backup_path)
                    except Exception:
                        pass
                if mp:
                    try:
                        os.symlink(dest_path, src_path)
                    except Exception as e:
                        migrate_status_write(aid, "error", error=f"symlink failed: {e}", pct=100)
                        return

                migrate_status_write(aid, "starting", pct=90)
                stratumos_cmd(["app", "up", aid], timeout_s=600)
                cleanup_ok = True
                cleanup_error = ""
                if not keep_backup:
                    migrate_status_write(aid, "cleaning", pct=95)
                    # Remove old copies:
                    # - If we were already on external storage, src_real is the old external directory.
                    # - If we migrated from local, backup_path is the renamed local directory.
                    candidates = []
                    if src_is_link:
                        candidates.append(src_real)
                    if backup_path:
                        candidates.append(backup_path)
                    # Best effort cleanup; keep the first failure.
                    for cand in candidates:
                        ok, err = _safe_delete_any(cand, allowed_roots)
                        if not ok and cleanup_ok:
                            cleanup_ok = False
                            cleanup_error = err
                migrate_status_write(
                    aid,
                    "done",
                    pct=100,
                    mountpoint=mp or "",
                    cleaned=bool(not keep_backup),
                    cleanup_ok=cleanup_ok,
                    cleanup_error=cleanup_error,
                )
            except Exception as e:
                migrate_status_write(aid, "error", error=str(e), pct=100)

        threading.Thread(target=worker, daemon=True).start()
        return {"ok": True, "started": True, "app_id": aid, "mountpoint": mp, "keep_backup": bool(keep_backup)}


def system_storage_orphans(scan_sizes: bool = False) -> dict:
    installed_defs = set(list_installed_app_ids())
    installed_reg = _installed_registry_installed_set()
    installed = set(installed_defs) | set(installed_reg)
    roots = _storage_app_roots()
    items: list[dict] = []

    def maybe_size(path: str) -> int | None:
        if not scan_sizes:
            return None
        proc = run_cmd(["du", "-sb", path], timeout_s=5)
        if proc.returncode != 0:
            return None
        try:
            return int(str((proc.stdout or "").split()[0]).strip() or "0")
        except Exception:
            return None

    for root, mp, label in roots:
        if not os.path.isdir(root):
            continue
        try:
            with os.scandir(root) as it:
                for ent in it:
                    name = ent.name
                    p = os.path.join(root, name)
                    if not ent.is_dir(follow_symlinks=False) and not ent.is_symlink():
                        continue
                    base_id = name
                    kind = "data"
                    reason = ""
                    if ".bak." in name:
                        base_id = name.split(".bak.", 1)[0]
                        kind = "backup"
                        reason = "migration backup"
                    elif ".migrating." in name:
                        base_id = name.split(".migrating.", 1)[0]
                        kind = "stale"
                        reason = "stale migration temp"
                    if ent.is_symlink():
                        try:
                            target = os.path.realpath(p)
                            if not os.path.exists(target):
                                kind = "broken_link"
                                reason = "broken symlink"
                        except Exception:
                            kind = "broken_link"
                            reason = "broken symlink"
                    if base_id not in installed:
                        if not reason:
                            reason = "app not installed"
                        sz = maybe_size(p)
                        items.append(
                            {
                                "path": p,
                                "mountpoint": mp,
                                "label": label,
                                "app_id": base_id,
                                "kind": kind,
                                "reason": reason,
                                "size_bytes": sz,
                                "size": _human_bytes(sz),
                            }
                        )
        except Exception:
            continue

    # Orphan containers: rely on compose project labels instead of parsing container names.
    # Container names often include the service suffix (e.g. 5tratumos-axebch-app-1) which
    # would be misidentified as "axebch-app" if we regex it. Use com.docker.compose.project.
    containers: list[dict] = []

    def _app_id_from_project(project: str) -> str:
        p = str(project or "").strip()
        if not p:
            return ""
        low = p.lower()
        for prefix in ("5tratumos-", "forgeos-"):
            if low.startswith(prefix):
                return low[len(prefix) :].strip("-")
        return ""

    proc = run_cmd(
        ["docker", "ps", "-a", "--format", "{{.Names}}\t{{.Label \"com.docker.compose.project\"}}"],
        timeout_s=6,
    )
    if proc.returncode == 0:
        for ln in (proc.stdout or "").splitlines():
            raw = ln.rstrip("\n")
            if not raw.strip():
                continue
            parts = raw.split("\t", 1)
            name = parts[0].strip()
            project = parts[1].strip() if len(parts) > 1 else ""
            if not name:
                continue

            app_id = _app_id_from_project(project)
            if app_id == "overlay":
                continue

            # Only consider 5tratumOS/ForgeOS compose projects as managed.
            if not app_id:
                continue

            if app_id in installed:
                continue
            containers.append({"name": name, "project": project, "app_id": app_id, "reason": "app not installed"})

    # "Safe" means we have some installed-app signal, OR there are no 5tratumos-* app containers
    # at all (so this looks like leftover data from old installs rather than a live system with
    # missing app definitions).
    safe = bool(installed) or (len(containers) == 0)
    warning = ""
    if not safe and (len(installed_defs) == 0 and len(installed_reg) == 0) and (len(containers) > 0):
        warning = (
            "No installed apps detected. Orphan cleanup is unsafe because app definitions may be missing. "
            "Reinstall/repair apps before deleting anything."
        )

    return {
        "ok": True,
        "time": _now_iso(),
        "sizes": bool(scan_sizes),
        "safe": safe,
        "warning": warning,
        "installed_defs": len(installed_defs),
        "installed_registry": len(installed_reg),
        "installed_total": len(installed),
        "data": items,
        "containers": containers,
    }


def system_storage_orphans_delete(body: dict) -> dict:
    if not isinstance(body, dict):
        return {"ok": False, "error": "invalid body"}
    if body.get("confirm") is not True:
        return {"ok": False, "error": "confirm required"}
    allowed_roots = [r for (r, _mp, _label) in _storage_app_roots()]
    installed = set(list_installed_app_ids()) | _installed_registry_installed_set()
    force = bool(body.get("force")) if isinstance(body, dict) else False

    paths = body.get("paths")
    containers = body.get("containers")
    path_list = [str(p).strip() for p in (paths or [])] if isinstance(paths, list) else []
    ctr_list = [str(c).strip() for c in (containers or [])] if isinstance(containers, list) else []

    deleted_paths: list[dict] = []
    for p in path_list:
        # Safety: refuse to delete data for apps we still consider installed unless forced.
        try:
            base = os.path.basename(p.rstrip("/\\"))
            base_id = base
            if ".bak." in base:
                base_id = base.split(".bak.", 1)[0]
            elif ".migrating." in base:
                base_id = base.split(".migrating.", 1)[0]
            base_id = str(base_id or "").strip().lower()
        except Exception:
            base_id = ""
        if base_id and base_id in installed and not force:
            deleted_paths.append({"path": p, "ok": False, "error": "refusing to delete installed app data"})
            continue
        ok, err = _safe_delete_any(p, allowed_roots)
        deleted_paths.append({"path": p, "ok": ok, "error": err})

    deleted_containers: list[dict] = []
    for name in ctr_list:
        if not name:
            continue
        proc = run_cmd(["docker", "rm", "-f", name], timeout_s=30)
        ok = proc.returncode == 0
        deleted_containers.append(
            {"name": name, "ok": ok, "error": (proc.stderr or proc.stdout or "").strip() if not ok else ""}
        )

    return {"ok": True, "time": _now_iso(), "paths": deleted_paths, "containers": deleted_containers}


AXE_SUITE_APP_IDS = {
    "axebch",
    "axedgb",
    "axebtc",
    "axebsv",
    "axelive",
    "axebench",
    "axemig",
}

AXE_SUITE_POOL_APP_IDS = {
    "axebch",
    "axedgb",
    "axebtc",
    "axebsv",
}


def _read_notify_config() -> dict:
    cfg = _read_json(NOTIFY_CONFIG_FILE)
    return cfg if isinstance(cfg, dict) else {}


def _write_notify_config(cfg: dict) -> None:
    _write_json_atomic(NOTIFY_CONFIG_FILE, cfg)
    try:
        os.chmod(NOTIFY_CONFIG_FILE, 0o600)
    except Exception:
        pass


def _notify_defaults() -> dict:
    return {
        "mqtt": {
            "enabled": False,
            "prefix": "5tratumOS",
            "apps": [],
            "events": {
                "status_change": True,
                "hashrate_drop": True,
                "worker_offline": True,
                "block_found": True,
            },
        },
        "discord": {
            "enabled": False,
            "webhook": "",
            "apps": [],
            "events": {
                "status_change": True,
                "hashrate_drop": True,
                "worker_offline": True,
                "block_found": True,
                "update_success": True,
                "update_failure": True,
                "restart": True,
            },
            "hashrate_drop_pct": 50,
        },
    }


def _normalize_events(raw: dict, defaults: dict) -> dict:
    out = dict(defaults)
    if not isinstance(raw, dict):
        return out
    for key in defaults:
        if key in raw:
            out[key] = bool(raw.get(key))
    return out


def _normalize_notify_config(cfg: dict) -> dict:
    base = _notify_defaults()
    mqtt = base["mqtt"]
    discord = base["discord"]

    raw_mqtt = cfg.get("mqtt") if isinstance(cfg, dict) else None
    if isinstance(raw_mqtt, dict):
        mqtt["enabled"] = bool(raw_mqtt.get("enabled"))
        prefix = str(raw_mqtt.get("prefix") or "").strip()
        if prefix.lower() == "5tratumos5tratumos":
            prefix = "5tratumOS"
        if prefix:
            mqtt["prefix"] = prefix
        raw_apps = raw_mqtt.get("apps")
        if isinstance(raw_apps, list):
            mqtt["apps"] = [str(a).strip().lower() for a in raw_apps if str(a).strip()]
        mqtt["events"] = _normalize_events(raw_mqtt.get("events") or {}, mqtt["events"])

    raw_discord = cfg.get("discord") if isinstance(cfg, dict) else None
    if isinstance(raw_discord, dict):
        discord["enabled"] = bool(raw_discord.get("enabled"))
        discord["webhook"] = str(raw_discord.get("webhook") or "").strip()
        raw_apps = raw_discord.get("apps")
        if isinstance(raw_apps, list):
            discord["apps"] = [str(a).strip().lower() for a in raw_apps if str(a).strip()]
        discord["events"] = _normalize_events(raw_discord.get("events") or {}, discord["events"])
        try:
            pct = int(str(raw_discord.get("hashrate_drop_pct") or "").strip() or "50")
        except Exception:
            pct = 50
        discord["hashrate_drop_pct"] = max(1, min(90, pct))

    return {"mqtt": mqtt, "discord": discord}


def _axesuite_installed_ids() -> list[str]:
    return [app_id for app_id in list_installed_app_ids() if app_id in AXE_SUITE_APP_IDS]


def _axesuite_installed_apps() -> list[dict]:
    apps = []
    for app_id in _axesuite_installed_ids():
        meta = store_app_by_id(app_id) or {}
        name = str(meta.get("name") or app_id)
        apps.append({"id": app_id, "name": name})
    return apps


def _mosquitto_compose_present() -> bool:
    return os.path.isfile(os.path.join(APPS_DIR, "mosquitto", "docker-compose.yml"))


def _mosquitto_installed() -> bool:
    return _mosquitto_compose_present()


def _mosquitto_running() -> bool:
    if not _mosquitto_installed():
        return False
    try:
        project = docker_compose_project("mosquitto")
        status = str(summarize_project_status(project).get("status") or "")
        return status == "running"
    except Exception:
        return False


def _mosquitto_available() -> bool:
    return _mosquitto_running()


def _mosquitto_pub_present() -> bool:
    for candidate in ("/usr/bin/mosquitto_pub", "/usr/local/bin/mosquitto_pub"):
        if os.path.isfile(candidate):
            return True
    return False


def _ensure_mosquitto_clients() -> dict:
    if _mosquitto_pub_present():
        return {"ok": True, "installed": True}
    upd = run_cmd(["apt-get", "update"], timeout_s=600)
    if upd.returncode != 0:
        return {"ok": False, "installed": False, "error": (upd.stderr or upd.stdout or "apt update failed").strip()}
    proc = run_cmd(["apt-get", "install", "-y", "--no-install-recommends", "mosquitto-clients"], timeout_s=900)
    if proc.returncode != 0:
        return {"ok": False, "installed": False, "error": (proc.stderr or proc.stdout or "install failed").strip()}
    return {"ok": True, "installed": _mosquitto_pub_present()}


def _looks_like_already_installed(res: dict) -> bool:
    if not isinstance(res, dict):
        return False
    msg = " ".join([str(res.get("error") or ""), str(res.get("stderr") or ""), str(res.get("stdout") or "")]).lower()
    return ("already installed" in msg) or ("app already installed" in msg) or ("is already installed" in msg)


def _app_compose_present(app_id: str) -> bool:
    app_id = str(app_id or "").strip()
    if not app_id:
        return False
    try:
        compose_path = os.path.join(APPS_DIR, app_id, "docker-compose.yml")
        return os.path.isfile(compose_path)
    except Exception:
        return False


def _docker_project_container_count(project: str) -> int | None:
    proj = str(project or "").strip()
    if not proj:
        return None
    proc = run_cmd(
        ["docker", "ps", "-a", "--filter", f"label=com.docker.compose.project={proj}", "--format", "{{.ID}}"],
        timeout_s=10,
    )
    if proc.returncode != 0:
        return None
    lines = [ln.strip() for ln in (proc.stdout or "").splitlines() if ln.strip()]
    return len(lines)


def _wait_for_app_removed(app_id: str, *, timeout_s: int = 90) -> dict:
    app = str(app_id or "").strip().lower()
    if not app:
        return {"ok": False, "error": "missing app id"}
    project = docker_compose_project(app)
    started = time.time()
    last = {"compose_present": _app_compose_present(app), "containers": _docker_project_container_count(project)}
    while time.time() - started < max(1, int(timeout_s)):
        compose_present = _app_compose_present(app)
        containers = _docker_project_container_count(project)
        last = {"compose_present": compose_present, "containers": containers}
        if not compose_present and (containers == 0):
            return {"ok": True, "time_s": int(time.time() - started), **last}
        time.sleep(1.5)
    return {"ok": False, "error": "timeout", "time_s": int(time.time() - started), **last}


def mqtt_config_get() -> dict:
    cfg = _normalize_notify_config(_read_notify_config())
    available = _mosquitto_available()
    if not available:
        cfg["mqtt"]["enabled"] = False
    return {"ok": True, "available": available, "apps": _axesuite_installed_apps(), "config": cfg["mqtt"]}


def mqtt_config_set(body: dict) -> dict:
    if not isinstance(body, dict):
        return {"ok": False, "error": "invalid body"}
    cfg = _normalize_notify_config(_read_notify_config())
    mqtt = cfg["mqtt"]

    if "enabled" in body:
        mqtt["enabled"] = bool(body.get("enabled"))
    if "prefix" in body:
        prefix = str(body.get("prefix") or "").strip()
        if prefix:
            mqtt["prefix"] = prefix
    if "events" in body:
        mqtt["events"] = _normalize_events(body.get("events") or {}, mqtt["events"])
    if "apps" in body:
        raw_apps = body.get("apps")
        if isinstance(raw_apps, list):
            mqtt["apps"] = [str(a).strip().lower() for a in raw_apps if str(a).strip()]

    if mqtt["enabled"] and not _mosquitto_compose_present():
        mosq_dir = os.path.join(APPS_DIR, "mosquitto")
        if os.path.isdir(mosq_dir):
            run_cmd(["rm", "-rf", mosq_dir], timeout_s=30)
        install_res = stratumos_cmd(["app", "install", "mosquitto", "--channel", "global"], timeout_s=600)
        if not install_res.get("ok") and not _mosquitto_compose_present():
            sync_res = stratumos_cmd(["store", "sync", "global"], timeout_s=600)
            if sync_res.get("ok"):
                install_res = stratumos_cmd(["app", "install", "mosquitto", "--channel", "global"], timeout_s=600)
        if not install_res.get("ok") and not _mosquitto_compose_present():
            return {"ok": False, "error": "mosquitto install failed", "detail": install_res}
    if mqtt["enabled"] and not _mosquitto_running():
        start_res = stratumos_cmd(["app", "up", "mosquitto"], timeout_s=300)
        if not start_res.get("ok") and not _mosquitto_running():
            return {"ok": False, "error": "mosquitto start failed", "detail": start_res}
    if mqtt["enabled"] and not _mosquitto_running():
        return {"ok": False, "error": "mosquitto not running"}
    if mqtt["enabled"] and not _mosquitto_pub_present():
        clients = _ensure_mosquitto_clients()
        if not clients.get("ok"):
            return {"ok": False, "error": "mosquitto clients install failed", "detail": clients}

    mqtt["apps"] = [a for a in mqtt.get("apps") or [] if a in AXE_SUITE_APP_IDS]
    cfg["mqtt"] = mqtt
    _write_notify_config(cfg)
    return {"ok": True, "saved": True}


def discord_config_get() -> dict:
    cfg = _normalize_notify_config(_read_notify_config())
    return {"ok": True, "apps": _axesuite_installed_apps(), "config": cfg["discord"]}


def discord_config_set(body: dict) -> dict:
    if not isinstance(body, dict):
        return {"ok": False, "error": "invalid body"}
    cfg = _normalize_notify_config(_read_notify_config())
    discord = cfg["discord"]

    if "enabled" in body:
        discord["enabled"] = bool(body.get("enabled"))
    if "webhook" in body:
        discord["webhook"] = str(body.get("webhook") or "").strip()
    if "events" in body:
        discord["events"] = _normalize_events(body.get("events") or {}, discord["events"])
    if "apps" in body:
        raw_apps = body.get("apps")
        if isinstance(raw_apps, list):
            discord["apps"] = [str(a).strip().lower() for a in raw_apps if str(a).strip()]
    if "hashrate_drop_pct" in body:
        try:
            pct = int(str(body.get("hashrate_drop_pct") or "").strip() or "50")
        except Exception:
            pct = 50
        discord["hashrate_drop_pct"] = max(1, min(90, pct))

    discord["apps"] = [a for a in discord.get("apps") or [] if a in AXE_SUITE_APP_IDS]
    cfg["discord"] = discord
    _write_notify_config(cfg)
    return {"ok": True, "saved": True}


def _watchdog_defaults() -> dict:
    return {"enabled": False, "interval_s": 30, "apps": []}


def _read_watchdog_config() -> dict:
    cfg = _read_json(WATCHDOG_CONFIG_FILE)
    return cfg if isinstance(cfg, dict) else {}


def _normalize_watchdog_config(raw: dict) -> dict:
    base = _watchdog_defaults()
    cfg = raw if isinstance(raw, dict) else {}
    out = {**base}
    out["enabled"] = bool(cfg.get("enabled"))
    try:
        interval = int(str(cfg.get("interval_s") or base["interval_s"]).strip() or base["interval_s"])
    except Exception:
        interval = int(base["interval_s"])
    out["interval_s"] = max(10, min(300, interval))
    apps = cfg.get("apps")
    if isinstance(apps, list):
        out["apps"] = [str(a).strip().lower() for a in apps if str(a).strip()]
    return out


def _installed_apps_for_watchdog() -> list[dict]:
    apps: list[dict] = []
    for app_id in list_installed_app_ids():
        meta = store_app_by_id(app_id) or {}
        name = str(meta.get("name") or app_id)
        apps.append({"id": app_id, "name": name})
    return apps


def watchdog_config_get() -> dict:
    cfg = _normalize_watchdog_config(_read_watchdog_config())
    installed = {a["id"] for a in _installed_apps_for_watchdog()}
    cfg["apps"] = [a for a in cfg.get("apps") or [] if a in installed]
    return {"ok": True, "apps": _installed_apps_for_watchdog(), "config": cfg}


def watchdog_config_set(body: dict) -> dict:
    if not isinstance(body, dict):
        return {"ok": False, "error": "invalid body"}
    cfg = _normalize_watchdog_config(_read_watchdog_config())
    if "enabled" in body:
        cfg["enabled"] = bool(body.get("enabled"))
    if "interval_s" in body:
        try:
            interval = int(str(body.get("interval_s") or "").strip() or cfg.get("interval_s") or 30)
        except Exception:
            interval = int(cfg.get("interval_s") or 30)
        cfg["interval_s"] = max(10, min(300, interval))
    if "apps" in body:
        raw_apps = body.get("apps")
        if isinstance(raw_apps, list):
            cfg["apps"] = [str(a).strip().lower() for a in raw_apps if str(a).strip()]

    installed = set(list_installed_app_ids())
    cfg["apps"] = [a for a in cfg.get("apps") or [] if a in installed]
    _write_json_atomic(WATCHDOG_CONFIG_FILE, cfg)
    return {"ok": True, "saved": True}


_WATCHDOG_LOCK = threading.Lock()
_WATCHDOG_STATE: dict[str, dict] = {}


def watchdog_note_manual_stop(app_id: str) -> None:
    aid = str(app_id or "").strip().lower()
    if not aid:
        return
    with _WATCHDOG_LOCK:
        cfg = _normalize_watchdog_config(_read_watchdog_config())
        if not cfg.get("enabled"):
            return
        apps = list(cfg.get("apps") or [])
        if aid not in apps:
            return
        cfg["apps"] = [a for a in apps if a != aid]
        try:
            _write_json_atomic(WATCHDOG_CONFIG_FILE, cfg)
        except Exception:
            pass


def _watchdog_loop() -> None:
    while True:
        try:
            cfg = _normalize_watchdog_config(_read_watchdog_config())
            interval_s = int(cfg.get("interval_s") or 30)
            time.sleep(max(10, interval_s))
            if not cfg.get("enabled"):
                continue
            apps = [str(a).strip().lower() for a in (cfg.get("apps") or []) if str(a).strip()]
            if not apps:
                continue

            now = time.time()
            for app_id in apps:
                project = docker_compose_project(app_id)
                st = summarize_project_status(project)
                status = str(st.get("status") or "")
                if status in {"running", "restarting"}:
                    continue
                if status == "not-created":
                    continue

                with _WATCHDOG_LOCK:
                    prev = _WATCHDOG_STATE.get(app_id) or {}
                    last = float(prev.get("last_attempt") or 0.0)
                    if (now - last) < 60:
                        continue
                    _WATCHDOG_STATE[app_id] = {"last_attempt": now}

                res = stratumos_cmd(["app", "up", app_id], timeout_s=600)
                if not res.get("ok"):
                    with _WATCHDOG_LOCK:
                        _WATCHDOG_STATE[app_id] = {"last_attempt": now, "last_error": str(res.get("error") or res.get("stderr") or "")}
        except Exception:
            time.sleep(10)


_NOTIFY_LOCK = threading.Lock()
_NOTIFY_POLL_S = 30
_NOTIFY_STATE_DIR = os.path.join(STATE_DIR, "notify")
_NOTIFY_STATE_PATH = os.path.join(_NOTIFY_STATE_DIR, "state.json")
_NOTIFY_STATE_LAST_SAVE_TS = 0.0
_NOTIFY_DIRTY = False


def _notify_state_load() -> dict[str, dict]:
    try:
        raw = _read_json(_NOTIFY_STATE_PATH)
        if not isinstance(raw, dict):
            return {"apps": {}, "update": {}}
        apps = raw.get("apps")
        update = raw.get("update")
        if not isinstance(apps, dict):
            apps = {}
        if not isinstance(update, dict):
            update = {}
        # Ensure a stable schema.
        return {"apps": dict(apps), "update": dict(update)}
    except Exception:
        return {"apps": {}, "update": {}}


def _notify_state_mark_dirty() -> None:
    global _NOTIFY_DIRTY
    _NOTIFY_DIRTY = True


def _notify_state_save_if_needed(*, force: bool = False) -> None:
    global _NOTIFY_STATE_LAST_SAVE_TS, _NOTIFY_DIRTY
    try:
        now = time.time()
        if not force:
            if not _NOTIFY_DIRTY:
                return
            # Rate limit to avoid excessive disk writes.
            if (now - _NOTIFY_STATE_LAST_SAVE_TS) < 15:
                return

        Path(_NOTIFY_STATE_DIR).mkdir(parents=True, exist_ok=True)
        # Persist only the minimal state needed to dedupe notifications across reboot.
        with _NOTIFY_LOCK:
            apps_out: dict[str, dict] = {}
            for app_id, st in (_NOTIFY_STATE.get("apps") or {}).items():
                if not isinstance(st, dict):
                    continue
                last_alert_ts = st.get("last_alert_ts")
                if not isinstance(last_alert_ts, (int, float)) or last_alert_ts <= 0:
                    continue
                apps_out[str(app_id)] = {"last_alert_ts": float(last_alert_ts)}
            update_out = _NOTIFY_STATE.get("update") if isinstance(_NOTIFY_STATE.get("update"), dict) else {}
            payload = {"apps": apps_out, "update": dict(update_out or {})}

        _write_json_atomic(_NOTIFY_STATE_PATH, payload)
        try:
            os.chmod(_NOTIFY_STATE_PATH, 0o600)
        except Exception:
            pass
        _NOTIFY_STATE_LAST_SAVE_TS = now
        _NOTIFY_DIRTY = False
    except Exception:
        return


_NOTIFY_STATE: dict[str, dict] = _notify_state_load()
if not isinstance(_NOTIFY_STATE, dict):
    _NOTIFY_STATE = {"apps": {}, "update": {}}
if "apps" not in _NOTIFY_STATE or not isinstance(_NOTIFY_STATE.get("apps"), dict):
    _NOTIFY_STATE["apps"] = {}
if "update" not in _NOTIFY_STATE or not isinstance(_NOTIFY_STATE.get("update"), dict):
    _NOTIFY_STATE["update"] = {}


def _selected_notify_apps(cfg: dict, installed: list[str]) -> list[str]:
    raw = cfg.get("apps") if isinstance(cfg, dict) else None
    if not isinstance(raw, list) or not raw:
        return installed
    out = [str(a).strip().lower() for a in raw if str(a).strip()]
    return [a for a in out if a in installed]


def _pool_block_signature(pool: dict | None) -> str:
    if not isinstance(pool, dict):
        return ""
    parts: list[str] = []
    keys = [
        "lastBlockFound",
        "last_block_found",
        "lastBlockFoundTime",
        "last_block_found_time",
        "lastPoolBlockTime",
        "block_height",
        "height",
        "blocksFound",
        "blocks_found",
        "lastBlockFoundHeight",
        "last_block_found_height",
    ]
    for key in keys:
        if key in pool:
            parts.append(f"{key}={pool.get(key)}")
    stats = pool.get("poolStats")
    if isinstance(stats, dict):
        for key in keys:
            if key in stats:
                parts.append(f"poolStats.{key}={stats.get(key)}")
    return "|".join(parts)


def _pool_hashrate_ths(pool: dict | None) -> float | None:
    if not isinstance(pool, dict):
        return None
    for key in ("hashrate_ths", "hashrate_1m_ths", "hashrate_5m_ths"):
        try:
            val = pool.get(key)
            if isinstance(val, (int, float)):
                return float(val)
            if isinstance(val, str) and val.strip():
                return float(val.strip())
        except Exception:
            continue

    # Some apps/pools expose hashrate in H/s; convert to TH/s.
    for key in ("hashrate_hs", "hashrate_1m_hs", "hashrate_5m_hs"):
        try:
            val = pool.get(key)
            if isinstance(val, (int, float)):
                return float(val) / 1e12
            if isinstance(val, str) and val.strip():
                return float(val.strip()) / 1e12
        except Exception:
            continue

    # Back-compat: if an app returns a bare "hashrate" field, assume TH/s unless it looks like H/s.
    try:
        val = pool.get("hashrate")
        if isinstance(val, (int, float)):
            v = float(val)
        elif isinstance(val, str) and val.strip():
            v = float(val.strip())
        else:
            v = None
        if v is not None:
            # Heuristic: absurdly large values are almost certainly H/s.
            return v / 1e12 if v > 1e6 else v
    except Exception:
        pass
    return None


def _pool_workers(pool: dict | None) -> int | None:
    if not isinstance(pool, dict):
        return None
    try:
        v = pool.get("workers")
        if v is None:
            return None
        return int(v)
    except Exception:
        return None


def _mqtt_publish(topic: str, payload: dict) -> None:
    pub = None
    for candidate in ("/usr/bin/mosquitto_pub", "/usr/local/bin/mosquitto_pub"):
        if os.path.isfile(candidate):
            pub = candidate
            break
    if not pub:
        return
    try:
        raw = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    except Exception:
        return
    run_cmd([pub, "-h", "127.0.0.1", "-t", topic, "-m", raw], timeout_s=5)


def _discord_send(webhook: str, payload: dict) -> None:
    if not webhook:
        return
    try:
        raw = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    except Exception:
        return
    req = urllib.request.Request(
        webhook,
        data=raw,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (5tratumOS; webhook)",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=6) as resp:  # noqa: S310
            resp.read()
    except Exception:
        pass


def _emit_notify_event(
    *,
    app_id: str,
    app_name: str,
    event: str,
    detail: str,
    extra: dict | None,
    mqtt_cfg: dict,
    discord_cfg: dict,
    mqtt_apps: list[str],
    discord_apps: list[str],
) -> None:
    ts = _now_iso()
    payload = {
        "time": ts,
        "app_id": app_id,
        "app_name": app_name,
        "event": event,
        "detail": detail,
    }
    if isinstance(extra, dict):
        payload["data"] = extra

    if mqtt_cfg.get("enabled") and (app_id == "system" or app_id in mqtt_apps):
        prefix = str(mqtt_cfg.get("prefix") or "5tratumos").strip() or "5tratumos"
        topic = f"{prefix}/apps/{app_id}/events/{event}"
        _mqtt_publish(topic, payload)

    if discord_cfg.get("enabled") and discord_cfg.get("webhook") and (app_id == "system" or app_id in discord_apps):
        content = f"**{app_name}** {detail}"
        _discord_send(str(discord_cfg.get("webhook") or ""), {"content": content, "ts": ts})


def _publish_mqtt_metrics(
    *,
    app_id: str,
    app_name: str,
    metrics: dict,
    mqtt_cfg: dict,
    mqtt_apps: list[str],
) -> None:
    if not mqtt_cfg.get("enabled") or app_id not in mqtt_apps:
        return
    prefix = str(mqtt_cfg.get("prefix") or "5tratumos").strip() or "5tratumos"
    payload = {"time": _now_iso(), "app_id": app_id, "app_name": app_name, **metrics}
    topic = f"{prefix}/apps/{app_id}/metrics"
    _mqtt_publish(topic, payload)


def _notify_loop() -> None:
    # Debounce/cooldown to avoid spam from transient polling errors or brief dips.
    # - require N consecutive validated samples before alerting
    # - rate-limit the same alert per app
    DROP_DEBOUNCE_N = 2
    WORKER_DEBOUNCE_N = 2
    ALERT_COOLDOWN_S = 10 * 60
    while True:
        try:
            cfg = _normalize_notify_config(_read_notify_config())
            mqtt_cfg = cfg.get("mqtt") or {}
            discord_cfg = cfg.get("discord") or {}

            installed = _axesuite_installed_ids()
            if not installed:
                time.sleep(_NOTIFY_POLL_S)
                continue

            mqtt_apps = _selected_notify_apps(mqtt_cfg, installed)
            discord_apps = _selected_notify_apps(discord_cfg, installed)
            events_mqtt = mqtt_cfg.get("events") if isinstance(mqtt_cfg, dict) else {}
            events_discord = discord_cfg.get("events") if isinstance(discord_cfg, dict) else {}
            drop_pct = int(discord_cfg.get("hashrate_drop_pct") or 50) if isinstance(discord_cfg, dict) else 50

            summary = axe_fleet_summary(limit_workers=0)
            pools = summary.get("pools") if isinstance(summary, dict) else []
            pool_by_id: dict[str, dict] = {}
            if isinstance(pools, list):
                for entry in pools:
                    if isinstance(entry, dict) and entry.get("id"):
                        pool_by_id[str(entry.get("id"))] = entry

            for app_id in installed:
                meta = store_app_by_id(app_id) or {}
                app_name = str(meta.get("name") or app_id)
                project = docker_compose_project(app_id)
                status = str(summarize_project_status(project).get("status") or "unknown")

                pool_entry = pool_by_id.get(app_id) or {}
                pool = pool_entry.get("pool") if isinstance(pool_entry, dict) else None
                hashrate = _pool_hashrate_ths(pool)
                workers = _pool_workers(pool)
                block_sig = _pool_block_signature(pool if isinstance(pool, dict) else None)

                metrics_to_publish: dict | None = None
                with _NOTIFY_LOCK:
                    prev = _NOTIFY_STATE["apps"].get(app_id, {})
                    # Keep last known-good hashrate/workers across transient poll failures.
                    prev_hashrate_good = prev.get("hashrate_ths")
                    prev_workers_good = prev.get("workers")
                    prev_drop_n = int(prev.get("drop_n") or 0)
                    prev_worker_n = int(prev.get("worker_n") or 0)
                    prev_last_alert = float(prev.get("last_alert_ts") or 0.0)

                    now_ts = time.time()
                    pool_ok = bool(pool_entry.get("ok")) if isinstance(pool_entry, dict) else False
                    # Don't treat cached/stale pool data as a "fresh" sample for notifications.
                    # Fleet may reuse the last-good reading when a poll times out; that should not
                    # trigger hashrate-drop spam.
                    sample_flag = None
                    stale_flag = False
                    if isinstance(pool_entry, dict):
                        if "sample_ok" in pool_entry:
                            sample_flag = bool(pool_entry.get("sample_ok"))
                        stale_flag = bool(pool_entry.get("stale"))
                    if sample_flag is None:
                        sample_valid = pool_ok and hashrate is not None and workers is not None
                    else:
                        sample_valid = bool(sample_flag) and (not stale_flag) and hashrate is not None and workers is not None

                    if sample_valid:
                        hashrate_good = float(hashrate)
                        workers_good = int(workers)
                    else:
                        hashrate_good = float(prev_hashrate_good) if isinstance(prev_hashrate_good, (int, float)) else None
                        workers_good = int(prev_workers_good) if isinstance(prev_workers_good, int) else None

                    metrics_to_publish = {
                        "status": status,
                        "hashrate_ths": hashrate_good,
                        "workers": workers_good,
                        "sample_ok": bool(sample_valid),
                    }

                    _NOTIFY_STATE["apps"][app_id] = {
                        "status": status,
                        "hashrate_ths": hashrate_good,
                        "workers": workers_good,
                        "block_sig": block_sig,
                        "drop_n": prev_drop_n,
                        "worker_n": prev_worker_n,
                        "last_alert_ts": prev_last_alert,
                        "sample_ok": bool(sample_valid),
                        "sample_ts": now_ts,
                    }

                if metrics_to_publish is not None:
                    _publish_mqtt_metrics(app_id=app_id, app_name=app_name, metrics=metrics_to_publish, mqtt_cfg=mqtt_cfg, mqtt_apps=mqtt_apps)

                prev_status = str(prev.get("status") or "")
                prev_hashrate = float(prev.get("hashrate_ths") or 0.0)
                prev_workers = int(prev.get("workers") or 0)
                prev_block = str(prev.get("block_sig") or "")
                prev_drop_n = int(prev.get("drop_n") or 0)
                prev_worker_n = int(prev.get("worker_n") or 0)
                prev_last_alert = float(prev.get("last_alert_ts") or 0.0)
                sample_ok = bool(_NOTIFY_STATE["apps"].get(app_id, {}).get("sample_ok"))
                now_ts = float(_NOTIFY_STATE["apps"].get(app_id, {}).get("sample_ts") or time.time())

                if status and status != prev_status and (events_mqtt.get("status_change") or events_discord.get("status_change")):
                    detail = f"status changed to {status}"
                    _emit_notify_event(
                        app_id=app_id,
                        app_name=app_name,
                        event="status_change",
                        detail=detail,
                        extra={"status": status},
                        mqtt_cfg=mqtt_cfg,
                        discord_cfg=discord_cfg,
                        mqtt_apps=mqtt_apps,
                        discord_apps=discord_apps,
                    )

                if status and status != prev_status and "restart" in status and events_discord.get("restart"):
                    detail = f"restarting ({status})"
                    _emit_notify_event(
                        app_id=app_id,
                        app_name=app_name,
                        event="restart",
                        detail=detail,
                        extra={"status": status},
                        mqtt_cfg=mqtt_cfg,
                        discord_cfg=discord_cfg,
                        mqtt_apps=mqtt_apps,
                        discord_apps=discord_apps,
                    )

                # Debounced alerts: only evaluate when the current sample is validated OK.
                if sample_ok and (events_mqtt.get("hashrate_drop") or events_discord.get("hashrate_drop")):
                    cur_hashrate = float(_NOTIFY_STATE["apps"][app_id].get("hashrate_ths") or 0.0)
                    threshold = prev_hashrate * (1 - (drop_pct / 100.0)) if prev_hashrate > 0 else 0.0
                    drop_now = prev_hashrate > 0 and cur_hashrate >= 0 and cur_hashrate <= threshold
                    with _NOTIFY_LOCK:
                        if drop_now:
                            _NOTIFY_STATE["apps"][app_id]["drop_n"] = int(_NOTIFY_STATE["apps"][app_id].get("drop_n") or 0) + 1
                        else:
                            _NOTIFY_STATE["apps"][app_id]["drop_n"] = 0
                        drop_n = int(_NOTIFY_STATE["apps"][app_id].get("drop_n") or 0)
                    if drop_now and drop_n >= DROP_DEBOUNCE_N and (now_ts - prev_last_alert) >= ALERT_COOLDOWN_S:
                        detail = f"hashrate dropped to {cur_hashrate:.2f} TH/s (was {prev_hashrate:.2f})"
                        _emit_notify_event(
                            app_id=app_id,
                            app_name=app_name,
                            event="hashrate_drop",
                            detail=detail,
                            extra={"hashrate_ths": cur_hashrate, "prev_hashrate_ths": prev_hashrate},
                            mqtt_cfg=mqtt_cfg,
                            discord_cfg=discord_cfg,
                            mqtt_apps=mqtt_apps,
                            discord_apps=discord_apps,
                        )
                        with _NOTIFY_LOCK:
                            _NOTIFY_STATE["apps"][app_id]["last_alert_ts"] = time.time()
                            _NOTIFY_STATE["apps"][app_id]["drop_n"] = 0
                        _notify_state_mark_dirty()

                if sample_ok and prev_workers > 0 and (events_mqtt.get("worker_offline") or events_discord.get("worker_offline")):
                    cur_workers = int(_NOTIFY_STATE["apps"][app_id].get("workers") or 0)
                    worker_drop_now = cur_workers < prev_workers
                    with _NOTIFY_LOCK:
                        if worker_drop_now:
                            _NOTIFY_STATE["apps"][app_id]["worker_n"] = int(_NOTIFY_STATE["apps"][app_id].get("worker_n") or 0) + 1
                        else:
                            _NOTIFY_STATE["apps"][app_id]["worker_n"] = 0
                        worker_n = int(_NOTIFY_STATE["apps"][app_id].get("worker_n") or 0)
                    if worker_drop_now and worker_n >= WORKER_DEBOUNCE_N and (now_ts - prev_last_alert) >= ALERT_COOLDOWN_S:
                        detail = f"workers dropped to {cur_workers} (was {prev_workers})"
                        _emit_notify_event(
                            app_id=app_id,
                            app_name=app_name,
                            event="worker_offline",
                            detail=detail,
                            extra={"workers": cur_workers, "prev_workers": prev_workers},
                            mqtt_cfg=mqtt_cfg,
                            discord_cfg=discord_cfg,
                            mqtt_apps=mqtt_apps,
                            discord_apps=discord_apps,
                        )
                        with _NOTIFY_LOCK:
                            _NOTIFY_STATE["apps"][app_id]["last_alert_ts"] = time.time()
                            _NOTIFY_STATE["apps"][app_id]["worker_n"] = 0
                        _notify_state_mark_dirty()

                if block_sig and prev_block and block_sig != prev_block and (
                    events_mqtt.get("block_found") or events_discord.get("block_found")
                ):
                    detail = "block detected"
                    _emit_notify_event(
                        app_id=app_id,
                        app_name=app_name,
                        event="block_found",
                        detail=detail,
                        extra={"block_sig": block_sig},
                        mqtt_cfg=mqtt_cfg,
                        discord_cfg=discord_cfg,
                        mqtt_apps=mqtt_apps,
                        discord_apps=discord_apps,
                    )

            st = update_status_read()
            if isinstance(st, dict):
                state = str(st.get("state") or "").strip().lower()
                with _NOTIFY_LOCK:
                    prev_update = _NOTIFY_STATE.get("update") or {}
                    prev_state = str(prev_update.get("state") or "")
                    _NOTIFY_STATE["update"] = {"state": state, "tag": str(st.get("target_tag") or "")}
                _notify_state_mark_dirty()

                if state != prev_state:
                    if state == "done" and events_discord.get("update_success"):
                        detail = f"update complete ({st.get('target_tag') or 'latest'})"
                        _emit_notify_event(
                            app_id="system",
                            app_name="System update",
                            event="update_success",
                            detail=detail,
                            extra={"target_tag": st.get("target_tag")},
                            mqtt_cfg=mqtt_cfg,
                            discord_cfg=discord_cfg,
                            mqtt_apps=mqtt_apps,
                            discord_apps=discord_apps,
                        )
                        _notify_state_save_if_needed(force=True)
                    if state == "error" and events_discord.get("update_failure"):
                        detail = f"update failed ({st.get('error') or 'unknown'})"
                        _emit_notify_event(
                            app_id="system",
                            app_name="System update",
                            event="update_failure",
                            detail=detail,
                            extra={"error": st.get("error")},
                            mqtt_cfg=mqtt_cfg,
                            discord_cfg=discord_cfg,
                            mqtt_apps=mqtt_apps,
                            discord_apps=discord_apps,
                        )
                        _notify_state_save_if_needed(force=True)

            _notify_state_save_if_needed()
            time.sleep(_NOTIFY_POLL_S)
        except Exception:
            time.sleep(_NOTIFY_POLL_S)


_UPDATE_LOCK = threading.Lock()
_UPDATE_CHECK_WAKE = threading.Event()
_UPDATE_CHECK_CACHE_LOCK = threading.Lock()
_UPDATE_CHECK_CACHE: dict[str, object] = {"checked_at": 0.0, "channel": "", "res": None}
_UPDATE_STATE_DIR = os.path.join(STATE_DIR, "update")
_UPDATE_STATUS_PATH = os.path.join(_UPDATE_STATE_DIR, "status.json")
_UPDATE_LOCK_PATH = os.path.join(_UPDATE_STATE_DIR, "lock.json")
_UPDATE_REPO_RE = re.compile(r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$")


def _pid_is_alive(pid: int) -> bool:
    if pid <= 0:
        return False
    try:
        return Path(f"/proc/{pid}").exists()
    except Exception:
        return False


def _update_lock_read() -> dict | None:
    return _read_json(_UPDATE_LOCK_PATH)


def _update_lock_write(*, target_tag: str) -> None:
    try:
        _write_json_atomic(
            _UPDATE_LOCK_PATH,
            {"pid": os.getpid(), "started_at": time.time(), "target_tag": str(target_tag or "").strip()},
        )
    except Exception:
        pass


def _update_lock_clear() -> None:
    try:
        Path(_UPDATE_LOCK_PATH).unlink()
    except Exception:
        pass


def _update_has_recent_artifacts(*, within_s: float) -> bool:
    try:
        root = Path(_UPDATE_STATE_DIR)
        if not root.is_dir():
            return False
        now = time.time()
        for p in (root / "bundle.tgz", root / "bundle.tgz.tmp"):
            try:
                if p.is_file() and (now - p.stat().st_mtime) <= within_s:
                    return True
            except Exception:
                pass
        for p in root.glob("stage-*"):
            try:
                if p.is_dir() and (now - p.stat().st_mtime) <= within_s:
                    return True
            except Exception:
                pass
        return False
    except Exception:
        return False


def update_status_read() -> dict:
    st = _read_json(_UPDATE_STATUS_PATH)
    if not st:
        return {"ok": True, "state": "idle", "time": _now_iso()}

    state = str(st.get("state") or "idle").strip().lower() or "idle"
    target = str(st.get("target_tag") or "").strip()
    build = read_build_info()
    installed = str(build.get("tag") or build.get("version") or "").strip()

    if state in {"downloading", "extracting", "deploying", "restarting", "restarting_daemon"}:
        lock = _update_lock_read()
        pid = int(lock.get("pid") or 0) if isinstance(lock, dict) else 0
        started_at = float(lock.get("started_at") or 0.0) if isinstance(lock, dict) else 0.0
        lock_ok = bool(pid and started_at and _pid_is_alive(pid))

        if not lock_ok:
            # Be conservative: if we see recent update artifacts, assume an older updater is still running.
            if not _update_has_recent_artifacts(within_s=15 * 60):
                st = {"ok": True, "state": "idle", "time": _now_iso()}
                try:
                    _write_json_atomic(_UPDATE_STATUS_PATH, st)
                except Exception:
                    pass
                return st

    # If the last step was "restart daemon" and we are back online with the target tag, mark done.
    if state in {"restarting_daemon", "restarting"} and target and installed == target:
        st = {**st, "state": "done", "time": _now_iso(), "ok": True, "progress": 100}
        try:
            _write_json_atomic(_UPDATE_STATUS_PATH, st)
        except Exception:
            pass
    return st


def _support_checkin_once() -> None:
    if not SUPPORT_CHECKIN_ENABLED:
        return
    if not SUPPORT_CHECKIN_URL:
        return

    try:
        now = time.time()
        st = _read_json(CHECKIN_STATE_PATH)
        last = float(st.get("last_ping_at") or 0.0)
        if (now - last) < float(24 * 60 * 60):
            return

        build = read_build_info()
        tag = str(build.get("tag") or build.get("version") or "").strip() or "unknown"
        channel = str(read_default_channel() or "main").strip().lower() or "main"
        apps = list_installed_app_ids()

        install_id = _get_or_create_install_id()
        payload = {
            "app": "5tratumOS",
            "version": tag,
            "channel": channel,
            "ts": int(now),
            "hostname": socket.gethostname(),
            "apps_installed": len(apps),
            "apps": apps,
        }
        _post_json(SUPPORT_CHECKIN_URL, payload, timeout_s=6, headers={INSTALL_ID_HEADER: str(install_id)})
        _write_json_atomic(CHECKIN_STATE_PATH, {"last_ping_at": now})
    except Exception:
        pass


def _support_checkin_loop() -> None:
    _support_checkin_once()
    # Wake periodically so failed pings retry sooner than 24h, but still enforce the 24h cadence.
    while True:
        time.sleep(60 * 60)
        _support_checkin_once()
    return st


def update_status_write(state: str, **extra: object) -> None:
    obj: dict = {"ok": True, "state": state, "time": _now_iso()}
    obj.update({k: v for k, v in extra.items() if v is not None})
    _write_json_atomic(_UPDATE_STATUS_PATH, obj)


def _sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(1024 * 1024)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def _read_update_pubkey() -> str:
    path = str(UPDATE_PUBKEY_FILE or "").strip()
    if not path:
        return ""
    try:
        raw = Path(path).read_text(encoding="utf-8")
    except Exception:
        return ""
    return raw.strip()


def _verify_ed25519_sig(*, file_path: str, sig_bytes: bytes, pubkey_pem: str) -> bool:
    if not file_path or not sig_bytes or not pubkey_pem:
        return False
    tmp_sig = f"{file_path}.sig.tmp"
    tmp_key = f"{file_path}.pub.tmp"
    try:
        Path(tmp_sig).write_bytes(sig_bytes)
        Path(tmp_key).write_text(pubkey_pem, encoding="utf-8")
        proc = run_cmd(
            [
                "openssl",
                "pkeyutl",
                "-verify",
                "-pubin",
                "-inkey",
                tmp_key,
                "-sigfile",
                tmp_sig,
                "-in",
                file_path,
            ],
            timeout_s=20,
        )
        return proc.returncode == 0
    except Exception:
        return False
    finally:
        for p in (tmp_sig, tmp_key):
            try:
                Path(p).unlink()
            except Exception:
                pass


def _tree_digest(path: str) -> str:
    root = Path(path)
    if not root.exists():
        return ""
    h = hashlib.sha256()
    for p in sorted(root.rglob("*"), key=lambda it: str(it)):
        if not p.is_file():
            continue
        if p.name.endswith(".pyc") or p.name == "__pycache__":
            continue
        rel = str(p.relative_to(root)).replace("\\", "/")
        h.update(rel.encode("utf-8"))
        h.update(b"\0")
        try:
            h.update(p.read_bytes())
        except Exception:
            continue
        h.update(b"\0")
    return h.hexdigest()


def _safe_extract_tar(tar: tarfile.TarFile, dest_dir: str) -> None:
    dest = Path(dest_dir).resolve()
    for member in tar.getmembers():
        name = member.name or ""
        if not name:
            continue
        member_path = (dest / name).resolve()
        if not str(member_path).startswith(str(dest)):
            raise ValueError(f"unsafe tar path: {name}")
    tar.extractall(dest_dir)


class _GitHubAuthRequired(Exception):
    pass


def _github_open(url: str, *, timeout_s: int, headers: dict[str, str], retry_with_token: bool = True):
    """
    Open a GitHub URL, trying without auth first. If the repo is private and a token exists, retry with token.

    GitHub returns 404 for private repos without auth, so treat 401/403/404 as potentially auth-related.
    """
    base_headers = {str(k): str(v) for k, v in (headers or {}).items()}

    def _req(hdrs: dict[str, str]):
        req = urllib.request.Request(url, headers=hdrs)
        return urllib.request.urlopen(req, timeout=timeout_s)  # nosec - expected HTTPS

    try:
        return _req(base_headers)
    except urllib.error.HTTPError as e:
        if e.code not in (401, 403, 404) or not retry_with_token:
            raise
        token = update_token()
        if not token:
            raise _GitHubAuthRequired("token required") from e
        auth_headers = dict(base_headers)
        auth_headers["Authorization"] = f"Bearer {token}"
        return _req(auth_headers)


def _github_json(url: str, *, timeout_s: int = 15) -> dict | list | None:
    headers = {
        "User-Agent": "5tratumOS",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    with _github_open(url, timeout_s=timeout_s, headers=headers, retry_with_token=True) as r:
        raw = r.read().decode("utf-8", errors="replace")
    try:
        return json.loads(raw)
    except Exception:
        return None


def _github_bytes(url: str, *, timeout_s: int = 60) -> bytes:
    headers = {"User-Agent": "5tratumOS"}
    if "/releases/assets/" in url:
        headers["Accept"] = "application/octet-stream"
    with _github_open(url, timeout_s=timeout_s, headers=headers, retry_with_token=True) as r:
        return r.read()


def _github_download_file(
    url: str,
    dest_path: str,
    *,
    timeout_s: int = 600,
    progress_cb: Callable[[int, int | None], None] | None = None,
) -> None:
    headers = {"User-Agent": "5tratumOS"}
    if "/releases/assets/" in url:
        headers["Accept"] = "application/octet-stream"
    with _github_open(url, timeout_s=timeout_s, headers=headers, retry_with_token=True) as r:
        total = None
        try:
            total_raw = str(r.headers.get("Content-Length") or "").strip()
            if total_raw:
                total = int(total_raw)
        except Exception:
            total = None
        written = 0
        with open(dest_path, "wb") as f:
            while True:
                chunk = r.read(256 * 1024)
                if not chunk:
                    break
                f.write(chunk)
                written += len(chunk)
                if progress_cb:
                    try:
                        progress_cb(written, total)
                    except Exception:
                        pass


def _select_release(channel: str) -> dict:
    repo = str(update_repo() or "").strip()
    if not repo or "/" not in repo:
        return {"ok": False, "error": f"invalid update repo: {repo}"}
    ch = (channel or "main").strip().lower() or "main"

    if ch in {"main", "dev"}:
        url = f"https://api.github.com/repos/{repo}/releases?per_page=30"
        try:
            data = _github_json(url, timeout_s=15)
        except _GitHubAuthRequired:
            return {"ok": False, "error": "token required", "token_required": True}
        except urllib.error.HTTPError as e:
            return {"ok": False, "error": f"github http {e.code}"}
        except Exception as e:
            return {"ok": False, "error": str(e)}

        if not isinstance(data, list):
            return {"ok": False, "error": "no releases published yet"}

        for rel in data:
            if not isinstance(rel, dict):
                continue
            if rel.get("draft"):
                continue
            if not rel.get("tag_name"):
                continue
            prerelease = rel.get("prerelease") is True
            if ch == "main" and prerelease:
                continue
            if ch == "dev" and not prerelease:
                continue
            return {"ok": True, "release": rel}

        if ch == "dev":
            return {"ok": False, "error": "no dev (pre-release) builds published yet"}
        return {"ok": False, "error": "no main releases published yet"}

    return {"ok": False, "error": f"invalid update channel: {ch}"}


def _pick_asset(assets: list[dict], names: list[str], ends: tuple[str, ...]) -> dict | None:
    for want in names:
        for a in assets:
            if not isinstance(a, dict):
                continue
            if str(a.get("name") or "") == want:
                return a
    for a in assets:
        if not isinstance(a, dict):
            continue
        n = str(a.get("name") or "")
        if n.lower().endswith(ends):
            return a
    return None


def _parse_sha256(text: str, bundle_name: str) -> str:
    raw = (text or "").strip()
    if not raw:
        return ""
    # "<sha>  <file>" or "<sha> <file>"
    for line in raw.splitlines():
        ln = line.strip()
        if not ln:
            continue
        parts = ln.split()
        if not parts:
            continue
        if len(parts[0]) == 64 and all(c in "0123456789abcdefABCDEF" for c in parts[0]):
            if len(parts) == 1:
                return parts[0].lower()
            if parts[-1] == bundle_name:
                return parts[0].lower()
    # fallback: first token if looks like sha256
    tok = raw.split()[0] if raw.split() else ""
    if len(tok) == 64 and all(c in "0123456789abcdefABCDEF" for c in tok):
        return tok.lower()
    return ""


def system_update_config_get() -> dict:
    cfg = _update_config_effective()
    tok_cfg = str(cfg.get("token") or cfg.get("github_token") or "").strip()
    tok_file = _read_update_token_file()
    tok_env = str(UPDATE_TOKEN_ENV or "").strip()
    token_present = bool(tok_cfg or tok_file or tok_env)
    pubkey_present = bool(_read_update_pubkey())
    return {
        "ok": True,
        "repo": str(update_repo()),
        "repo_source": "fixed",
        "token_configured": token_present,
        "token_source": "file" if tok_file else ("config" if tok_cfg else ("env" if tok_env else "none")),
        "check_interval_s": int(cfg.get("check_interval_s") or 3600),
        "auto_apply": bool(cfg.get("auto_apply")),
        "dismissed_tag": str(cfg.get("dismissed_tag") or ""),
        "allow_unverified": bool(UPDATE_ALLOW_UNVERIFIED),
        "sig_required": bool(UPDATE_REQUIRE_SIG),
        "sig_pubkey_present": pubkey_present,
    }


def system_update_config_set(body: dict) -> dict:
    if not isinstance(body, dict):
        return {"ok": False, "error": "invalid body"}

    cfg = _update_config_effective()

    cfg.pop("repo", None)

    if "token" in body or "github_token" in body:
        token = str(body.get("token") or body.get("github_token") or "").strip()
        # Keep tokens out of JSON by default.
        _write_update_token_file(token)
        cfg.pop("token", None)
        cfg.pop("github_token", None)

    if "check_interval_s" in body or "check_interval" in body:
        cfg["check_interval_s"] = _normalize_update_check_interval_s(body.get("check_interval_s") or body.get("check_interval"))

    if "auto_apply" in body or "auto_update" in body:
        cfg["auto_apply"] = bool(body.get("auto_apply") if "auto_apply" in body else body.get("auto_update"))

    if "dismissed_tag" in body:
        cfg["dismissed_tag"] = str(body.get("dismissed_tag") or "").strip()

    _write_update_config(cfg)
    try:
        _UPDATE_CHECK_WAKE.set()
    except Exception:
        pass
    return {**system_update_config_get(), "saved": True}


def system_update_check_cached(channel: str | None = None, *, force: bool = False) -> dict:
    ch = (channel or read_default_channel() or "main").strip().lower() or "main"
    now = time.time()

    if not force:
        try:
            with _UPDATE_CHECK_CACHE_LOCK:
                cached_at = float(_UPDATE_CHECK_CACHE.get("checked_at") or 0.0)
                cached_ch = str(_UPDATE_CHECK_CACHE.get("channel") or "")
                cached_res = _UPDATE_CHECK_CACHE.get("res")
            if cached_res and cached_ch == ch and (now - cached_at) < 30:
                return cached_res  # type: ignore[return-value]
        except Exception:
            pass

    res = system_update_check(ch)
    try:
        with _UPDATE_CHECK_CACHE_LOCK:
            _UPDATE_CHECK_CACHE["checked_at"] = now
            _UPDATE_CHECK_CACHE["channel"] = ch
            _UPDATE_CHECK_CACHE["res"] = res
    except Exception:
        pass
    return res


def _system_update_check_loop() -> None:
    next_check_at = 0.0
    while True:
        try:
            cfg = _update_config_effective()
            interval_s = int(cfg.get("check_interval_s") or 3600)
            interval_s = max(300, interval_s)  # avoid tight loops

            if next_check_at <= 0:
                next_check_at = time.time() + 10

            wait_s = max(1.0, next_check_at - time.time())
            woke = False
            try:
                woke = _UPDATE_CHECK_WAKE.wait(timeout=wait_s)
            finally:
                _UPDATE_CHECK_WAKE.clear()

            if woke:
                next_check_at = 0.0
                continue

            channel = read_default_channel() or "main"
            check = system_update_check_cached(channel, force=True)

            if bool(cfg.get("auto_apply")) and bool(check.get("update_available")) and bool(check.get("notify_available")):
                try:
                    system_update_apply(channel)
                except Exception:
                    pass

            next_check_at = time.time() + interval_s
        except Exception:
            time.sleep(30)


def system_update_check(channel: str | None = None) -> dict:
    ch = (channel or read_default_channel() or "main").strip().lower() or "main"
    sel = _select_release(ch)
    build = read_build_info()
    installed_tag = str(build.get("tag") or build.get("version") or "unknown").strip() or "unknown"
    cfg = _update_config_effective()
    dismissed_tag = str(cfg.get("dismissed_tag") or "").strip()
    if not sel.get("ok"):
        return {
            "ok": True,
            "channel": ch,
            "installed": {"tag": installed_tag},
            "available": None,
            "update_available": False,
            "notify_available": False,
            "dismissed_tag": dismissed_tag,
            "error": sel.get("error") or "",
            "token_required": bool(sel.get("token_required")),
        }

    rel = sel.get("release") or {}
    tag = str(rel.get("tag_name") or "").strip()
    body = str(rel.get("body") or "").strip()
    published_at = str(rel.get("published_at") or rel.get("created_at") or "").strip()
    assets = rel.get("assets") if isinstance(rel.get("assets"), list) else []

    bundle = _pick_asset(
        assets,
        names=["5tratumos-update.tgz", "5tratum-update.tgz", "update.tgz"],
        ends=(".tgz", ".tar.gz"),
    )
    if not bundle:
        return {
            "ok": True,
            "channel": ch,
            "installed": {"tag": installed_tag},
            "available": {"tag": tag, "published_at": published_at, "notes": body},
            "update_available": False,
            "error": "release has no update bundle asset (.tgz)",
        }

    bundle_name = str(bundle.get("name") or "").strip()
    bundle_url = str(bundle.get("url") or bundle.get("browser_download_url") or "").strip()

    sha_asset = _pick_asset(
        assets,
        names=[f"{bundle_name}.sha256", f"{bundle_name}.sha256sum", "SHA256SUMS"],
        ends=(".sha256", ".sha256sum"),
    )
    sha256 = ""
    sha_url = ""
    if sha_asset:
        sha_url = str(sha_asset.get("url") or sha_asset.get("browser_download_url") or "").strip()
        try:
            sha256 = _parse_sha256(_github_bytes(sha_url, timeout_s=30).decode("utf-8", errors="replace"), bundle_name)
        except Exception:
            sha256 = ""

    sig_asset = _pick_asset(
        assets,
        names=[f"{bundle_name}.sig", "update.sig", "SIGNATURE"],
        ends=(".sig",),
    )
    sig_url = ""
    if sig_asset:
        sig_url = str(sig_asset.get("url") or sig_asset.get("browser_download_url") or "").strip()

    verifiable = bool(sha256) or UPDATE_ALLOW_UNVERIFIED
    update_available = bool(tag and tag != installed_tag and verifiable)
    sig_required = bool(UPDATE_REQUIRE_SIG or _read_update_pubkey())
    sig_available = bool(sig_url)
    notify_available = bool(update_available and tag and tag != dismissed_tag)
    return {
        "ok": True,
        "channel": ch,
        "repo": str(update_repo()),
        "installed": {"tag": installed_tag},
        "available": {
            "tag": tag,
            "published_at": published_at,
            "notes": body,
            "bundle": {"name": bundle_name, "url": bundle_url, "sha256": sha256 or "", "sig_url": sig_url or ""},
            "verifiable": bool(sha256),
            "signature_required": sig_required,
            "signature_available": sig_available,
        },
        "update_available": bool(update_available),
        "notify_available": bool(notify_available),
        "dismissed_tag": dismissed_tag,
        "unverified_allowed": bool(UPDATE_ALLOW_UNVERIFIED),
    }


def _mirror_tree(src: str, dst: str) -> None:
    src_p = Path(src)
    dst_p = Path(dst)
    if not src_p.is_dir():
        return
    dst_p.mkdir(parents=True, exist_ok=True)

    src_children = {p.name for p in src_p.iterdir()}
    for p in list(dst_p.iterdir()):
        if p.name not in src_children:
            if p.is_dir():
                for sub in sorted(p.rglob("*"), reverse=True):
                    try:
                        if sub.is_file() or sub.is_symlink():
                            sub.unlink()
                        elif sub.is_dir():
                            sub.rmdir()
                    except Exception:
                        pass
                try:
                    p.rmdir()
                except Exception:
                    pass
            else:
                try:
                    p.unlink()
                except Exception:
                    pass

    for p in src_p.iterdir():
        s = p
        d = dst_p / p.name
        if s.is_dir():
            _mirror_tree(str(s), str(d))
        elif s.is_file():
            d.parent.mkdir(parents=True, exist_ok=True)
            data = s.read_bytes()
            tmp = d.with_suffix(d.suffix + ".tmp")
            tmp.write_bytes(data)
            try:
                os.chmod(tmp, s.stat().st_mode)
            except Exception:
                pass
            os.replace(tmp, d)


def _coalesce_nested_dir(*, root: Path, nested_name: str, marker: str) -> Path:
    if not root.is_dir():
        return root
    if (root / marker).is_file():
        return root
    nested = root / nested_name
    if nested.is_dir() and (nested / marker).is_file():
        return nested
    return root


def _flatten_current_install(*, root: Path, nested_name: str, marker: str) -> None:
    if not root.is_dir():
        return
    if (root / marker).is_file():
        return
    nested = root / nested_name
    if nested.is_dir() and (nested / marker).is_file():
        _mirror_tree(str(nested), str(root))


def system_update_apply(channel: str | None = None) -> dict:
    ch = (channel or read_default_channel() or "main").strip().lower() or "main"
    with _UPDATE_LOCK:
        st = update_status_read()
        if str(st.get("state") or "").strip().lower() in {"downloading", "extracting", "deploying", "restarting", "restarting_daemon"}:
            return {"ok": False, "error": "update already in progress"}

        check = system_update_check(ch)
        if not check.get("ok"):
            return {"ok": False, "error": "unable to check updates"}
        if bool(check.get("token_required")) and not bool(check.get("update_available")):
            return {"ok": False, "error": check.get("error") or "token required", "token_required": True}
        if not check.get("available"):
            return {"ok": False, "error": check.get("error") or "no updates available"}
        if not check.get("update_available"):
            return {"ok": False, "error": check.get("error") or "no verified update available"}

        target = check.get("available") or {}
        bundle = (target.get("bundle") or {}) if isinstance(target, dict) else {}
        target_tag = str(target.get("tag") or "").strip()
        bundle_url = str(bundle.get("url") or "").strip()
        bundle_sha = str(bundle.get("sha256") or "").strip().lower()
        sig_url = str(bundle.get("sig_url") or "").strip()
        if not target_tag or not bundle_url:
            return {"ok": False, "error": "invalid release metadata"}
        if not bundle_sha and not UPDATE_ALLOW_UNVERIFIED:
            return {"ok": False, "error": "no checksum for update bundle (refusing unverified update)"}
        pubkey = _read_update_pubkey()
        sig_required = bool(UPDATE_REQUIRE_SIG or pubkey)
        if sig_required and not sig_url:
            return {"ok": False, "error": "update signature required but missing (.sig asset)"}
        if sig_required and not pubkey:
            return {"ok": False, "error": "update signature required but public key not configured"}

        def worker() -> None:
            _update_lock_write(target_tag=target_tag)
            try:
                update_status_write("downloading", target_tag=target_tag, progress=0)
                os.makedirs(_UPDATE_STATE_DIR, exist_ok=True)
                bundle_path = os.path.join(_UPDATE_STATE_DIR, "bundle.tgz")
                stage_dir = os.path.join(_UPDATE_STATE_DIR, f"stage-{int(time.time())}")
                tmp = bundle_path + ".tmp"
                last_pct = -1
                last_tick = 0.0

                def download_progress(written: int, total: int | None) -> None:
                    nonlocal last_pct, last_tick
                    if not total or total <= 0:
                        return
                    now = time.time()
                    if now - last_tick < 0.35:
                        return
                    last_tick = now
                    pct = int((written / total) * 35.0)
                    pct = max(0, min(35, pct))
                    if pct == last_pct:
                        return
                    last_pct = pct
                    update_status_write("downloading", target_tag=target_tag, progress=pct)

                _github_download_file(bundle_url, tmp, timeout_s=600, progress_cb=download_progress)
                os.replace(tmp, bundle_path)
                update_status_write("downloading", target_tag=target_tag, progress=35)

                if bundle_sha:
                    got = _sha256_file(bundle_path)
                    if got.lower() != bundle_sha.lower():
                        update_status_write("error", target_tag=target_tag, error="checksum mismatch", progress=100)
                        return

                if sig_required:
                    try:
                        sig_bytes = _github_bytes(sig_url, timeout_s=60) if sig_url else b""
                    except Exception:
                        sig_bytes = b""
                    if not sig_bytes or not _verify_ed25519_sig(file_path=bundle_path, sig_bytes=sig_bytes, pubkey_pem=pubkey):
                        update_status_write("error", target_tag=target_tag, error="signature verification failed", progress=100)
                        return

                update_status_write("extracting", target_tag=target_tag, progress=40)
                if os.path.isdir(stage_dir):
                    for p in sorted(Path(stage_dir).rglob("*"), reverse=True):
                        try:
                            if p.is_file() or p.is_symlink():
                                p.unlink()
                            elif p.is_dir():
                                p.rmdir()
                        except Exception:
                            pass
                    try:
                        Path(stage_dir).rmdir()
                    except Exception:
                        pass
                os.makedirs(stage_dir, exist_ok=True)

                with tarfile.open(bundle_path, "r:gz") as tar:
                    _safe_extract_tar(tar, stage_dir)
                update_status_write("extracting", target_tag=target_tag, progress=55)

                stage_root = Path(stage_dir)
                stage_overlay = _coalesce_nested_dir(root=stage_root / "overlay", nested_name="overlay", marker="docker-compose.yml")
                stage_daemon = _coalesce_nested_dir(root=stage_root / "daemon", nested_name="daemon", marker="5tratumosd.py")
                stage_systemd = stage_root / "systemd"
                stage_bin = stage_root / "bin" / "5tratumos"

                cur_overlay = Path(ROOT_DIR) / "overlay"
                cur_daemon = Path(ROOT_DIR) / "daemon"
                cur_systemd = Path("/etc/systemd/system")

                # Self-heal: previous bad bundles may have nested overlay/daemon dirs (overlay/overlay, daemon/daemon).
                _flatten_current_install(root=cur_overlay, nested_name="overlay", marker="docker-compose.yml")
                _flatten_current_install(root=cur_daemon, nested_name="daemon", marker="5tratumosd.py")

                # Always restart the daemon after applying a bundle that contains daemon files.
                # This guarantees new Python code is actually loaded (even if the file contents
                # were already present on disk) and keeps update UX consistent.
                daemon_changed = stage_daemon.is_dir()
                overlay_cfg_changed = False
                if stage_overlay.is_dir():
                    stage_cfg = hashlib.sha256()
                    for rel in ("docker-compose.yml", "nginx/default.conf"):
                        p = stage_overlay / rel
                        if p.is_file():
                            stage_cfg.update(rel.encode("utf-8"))
                            stage_cfg.update(b"\0")
                            stage_cfg.update(p.read_bytes())
                            stage_cfg.update(b"\0")
                    cur_cfg = hashlib.sha256()
                    for rel in ("docker-compose.yml", "nginx/default.conf"):
                        p = cur_overlay / rel
                        if p.is_file():
                            cur_cfg.update(rel.encode("utf-8"))
                            cur_cfg.update(b"\0")
                            cur_cfg.update(p.read_bytes())
                    cur_cfg.update(b"\0")
                    overlay_cfg_changed = stage_cfg.hexdigest() != cur_cfg.hexdigest()

                systemd_changed = _systemd_units_changed(stage_systemd, cur_systemd)

                update_status_write(
                    "deploying",
                    target_tag=target_tag,
                    progress=60,
                    restarts={
                        "overlay": bool(overlay_cfg_changed),
                        "daemon": bool(daemon_changed),
                        "systemd": bool(systemd_changed),
                    },
                )

                if stage_overlay.is_dir():
                    update_status_write(
                        "deploying",
                        target_tag=target_tag,
                        progress=70,
                        restarts={
                            "overlay": bool(overlay_cfg_changed),
                            "daemon": bool(daemon_changed),
                            "systemd": bool(systemd_changed),
                        },
                    )
                    _mirror_tree(str(stage_overlay), str(cur_overlay))
                if stage_daemon.is_dir():
                    update_status_write(
                        "deploying",
                        target_tag=target_tag,
                        progress=80,
                        restarts={
                            "overlay": bool(overlay_cfg_changed),
                            "daemon": bool(daemon_changed),
                            "systemd": bool(systemd_changed),
                        },
                    )
                    _mirror_tree(str(stage_daemon), str(cur_daemon))
                    _flatten_current_install(root=cur_daemon, nested_name="daemon", marker="5tratumosd.py")
                if (stage_root / "apps-available").is_dir():
                    update_status_write(
                        "deploying",
                        target_tag=target_tag,
                        progress=84,
                        restarts={
                            "overlay": bool(overlay_cfg_changed),
                            "daemon": bool(daemon_changed),
                            "systemd": bool(systemd_changed),
                        },
                    )
                    _mirror_tree(str(stage_root / "apps-available"), str(Path(ROOT_DIR) / "apps-available"))
                if (stage_root / "bootstrap").is_dir():
                    update_status_write(
                        "deploying",
                        target_tag=target_tag,
                        progress=86,
                        restarts={
                            "overlay": bool(overlay_cfg_changed),
                            "daemon": bool(daemon_changed),
                            "systemd": bool(systemd_changed),
                        },
                    )
                    _mirror_tree(str(stage_root / "bootstrap"), str(Path(ROOT_DIR) / "bootstrap"))
                if (stage_root / "console").is_dir():
                    _mirror_tree(str(stage_root / "console"), str(Path(ROOT_DIR) / "console"))
                    # Ensure kiosk is actually installed/enabled on systems with a local display.
                    # (Updates previously only copied the console files but never ran the installer.)
                    try:
                        console_dir = os.path.join(ROOT_DIR, "console")
                        for name in ("install.sh", "5tratumos-console.sh", "5tratumos-x11-session.sh"):
                            p = os.path.join(console_dir, name)
                            if os.path.isfile(p):
                                _normalize_crlf_inplace(p)
                                try:
                                    os.chmod(p, 0o755)
                                except Exception:
                                    pass
                        has_display = os.path.exists("/dev/dri/card0") or os.path.exists("/dev/fb0")
                        if has_display and os.path.isfile(os.path.join(ROOT_DIR, "console", "install.sh")):
                            if shutil.which("systemd-run"):
                                run_cmd(
                                    [
                                        "systemd-run",
                                        "--unit=5tratumos-console-install",
                                        "--collect",
                                        "--property=After=network-online.target",
                                        "--property=Wants=network-online.target",
                                        "/bin/bash",
                                        os.path.join(ROOT_DIR, "console", "install.sh"),
                                    ],
                                    timeout_s=30,
                                )
                            else:
                                run_cmd(
                                    [
                                        "/bin/bash",
                                        "-lc",
                                        f"nohup /bin/bash {shlex.quote(os.path.join(ROOT_DIR,'console','install.sh'))} >/var/log/5tratumos-console-install.log 2>&1 &",
                                    ],
                                    timeout_s=30,
                                )
                    except Exception:
                        pass

                if stage_bin.is_file():
                    run_cmd(["install", "-m", "0755", str(stage_bin), "/usr/local/bin/5tratumos"], timeout_s=60)

                if stage_systemd.is_dir():
                    for unit in sorted(stage_systemd.glob("*.service"), key=lambda it: it.name):
                        run_cmd(["install", "-m", "0644", str(unit), str(cur_systemd / unit.name)], timeout_s=30)

                write_build_info(
                    {
                        "tag": target_tag,
                        "repo": str(update_repo()),
                        "channel": ch,
                        "installed_at": _now_iso(),
                    }
                )

                if systemd_changed:
                    run_cmd(["systemctl", "daemon-reload"], timeout_s=60)

                if overlay_cfg_changed:
                    update_status_write("restarting", target_tag=target_tag, service="overlay", progress=92)
                    run_cmd(["systemctl", "restart", "5tratumos-overlay.service"], timeout_s=180)

                if daemon_changed:
                    update_status_write("restarting_daemon", target_tag=target_tag, service="daemon", progress=96)
                    run_cmd(["systemctl", "restart", "5tratumosd.service"], timeout_s=180)
                    return

                update_status_write("done", target_tag=target_tag, progress=100)
            except Exception as e:
                update_status_write("error", target_tag=target_tag, error=str(e), progress=100)
            finally:
                _update_lock_clear()

        threading.Thread(target=worker, daemon=True).start()
        return {"ok": True, "started": True, "target_tag": target_tag}


def _systemd_units_changed(stage_dir: Path, dest_dir: Path) -> bool:
    if not stage_dir.is_dir():
        return False
    h_stage = hashlib.sha256()
    h_dest = hashlib.sha256()
    any_unit = False
    for unit in sorted(stage_dir.glob("*.service"), key=lambda it: it.name):
        if not unit.is_file():
            continue
        any_unit = True
        h_stage.update(unit.name.encode("utf-8"))
        h_stage.update(b"\0")
        h_stage.update(unit.read_bytes())
        h_stage.update(b"\0")

        dest = dest_dir / unit.name
        h_dest.update(unit.name.encode("utf-8"))
        h_dest.update(b"\0")
        if dest.is_file():
            try:
                h_dest.update(dest.read_bytes())
            except Exception:
                pass
        h_dest.update(b"\0")
    if not any_unit:
        return False
    return h_stage.hexdigest() != h_dest.hexdigest()


def json_response(
    handler: BaseHTTPRequestHandler,
    status: int,
    payload: dict,
    headers: list[tuple[str, str]] | None = None,
) -> None:
    raw = json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(raw)))
    if headers:
        for k, v in headers:
            handler.send_header(k, v)
    handler.end_headers()
    try:
        handler.wfile.write(raw)
    except (BrokenPipeError, ConnectionResetError):
        # Client closed the connection while we were writing the response.
        return


def read_body_json(handler: BaseHTTPRequestHandler) -> dict:
    length_raw = handler.headers.get("Content-Length", "0")
    try:
        length = int(length_raw)
    except ValueError:
        length = 0
    if length <= 0:
        return {}
    raw = handler.rfile.read(length)
    if not raw:
        return {}
    try:
        return json.loads(raw.decode("utf-8"))
    except Exception:
        return {}


def _b64e(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def _b64d(raw: str) -> bytes:
    s = (raw or "").strip()
    if not s:
        return b""
    pad = "=" * ((4 - (len(s) % 4)) % 4)
    return base64.urlsafe_b64decode(s + pad)


def _hash_password(password: str, *, salt_b64: str | None = None) -> tuple[str, str]:
    salt = _b64d(salt_b64) if salt_b64 else secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", (password or "").encode("utf-8"), salt, 210_000, dklen=32)
    return _b64e(salt), _b64e(dk)


def _verify_password(password: str, *, salt_b64: str, hash_b64: str) -> bool:
    salt = _b64d(salt_b64)
    expected = _b64d(hash_b64)
    if not salt or not expected:
        return False
    dk = hashlib.pbkdf2_hmac("sha256", (password or "").encode("utf-8"), salt, 210_000, dklen=len(expected))
    return hmac.compare_digest(dk, expected)


def _read_auth() -> dict:
    path = Path(AUTH_FILE)
    if not path.is_file():
        return {"version": 1, "users": []}
    try:
        obj = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {"version": 1, "users": []}
    if not isinstance(obj, dict):
        return {"version": 1, "users": []}
    users = obj.get("users")
    if not isinstance(users, list):
        users = []
    obj["users"] = users
    obj.setdefault("version", 1)
    return obj


def _write_auth(obj: dict) -> None:
    path = Path(AUTH_FILE)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    try:
        os.chmod(path, 0o600)
    except Exception:
        pass


def _read_features() -> dict:
    path = Path(FEATURES_FILE)
    if not path.is_file():
        return {}
    try:
        obj = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}
    return obj if isinstance(obj, dict) else {}


def _write_features(obj: dict) -> None:
    path = Path(FEATURES_FILE)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    try:
        os.chmod(path, 0o644)
    except Exception:
        pass


_USERNAME_RE = re.compile(r"^[a-z0-9][a-z0-9._-]{2,31}$")


def _normalize_username(username: str) -> str:
    return (username or "").strip().lower()


def _validate_username(username: str) -> str | None:
    u = _normalize_username(username)
    if not _USERNAME_RE.fullmatch(u):
        return "Username must be 3–32 chars: a-z, 0-9, dot, underscore, dash."
    return None


def _cookie_map(handler: BaseHTTPRequestHandler) -> dict[str, str]:
    raw = handler.headers.get("Cookie") or ""
    out: dict[str, str] = {}
    for part in raw.split(";"):
        part = part.strip()
        if not part or "=" not in part:
            continue
        k, v = part.split("=", 1)
        k = k.strip()
        if not k:
            continue
        out[k] = v.strip()
    return out


def _prune_sessions(now: float) -> None:
    expired = [sid for sid, sess in _SESSIONS.items() if float(sess.get("expires") or 0) <= now]
    for sid in expired:
        _SESSIONS.pop(sid, None)


def current_user(handler: BaseHTTPRequestHandler) -> str | None:
    sid = _cookie_map(handler).get(SESSION_COOKIE) or ""
    if not sid:
        return None
    now = time.time()
    with _AUTH_LOCK:
        _prune_sessions(now)
        sess = _SESSIONS.get(sid) or None
        if not sess:
            return None
        user = str(sess.get("user") or "").strip()
        if not user:
            return None
        auth = _read_auth()
        users = auth.get("users") if isinstance(auth.get("users"), list) else []
        if not any(str(u.get("username") or "").strip().lower() == user.lower() for u in users if isinstance(u, dict)):
            _SESSIONS.pop(sid, None)
            return None
        return user


_INTERNAL_SESSION_LOCK = threading.Lock()
_INTERNAL_SESSION: dict[str, float | str] = {"sid": "", "exp": 0.0}


def _internal_session_cookie() -> str | None:
    now = time.time()
    with _INTERNAL_SESSION_LOCK:
        sid = str(_INTERNAL_SESSION.get("sid") or "")
        exp = float(_INTERNAL_SESSION.get("exp") or 0.0)
        if sid and exp - now > 60:
            return sid

        # Use the first configured user to mint a service session for internal scrapes.
        auth = _read_auth()
        users = auth.get("users") if isinstance(auth.get("users"), list) else []
        username = ""
        for u in users:
            if not isinstance(u, dict):
                continue
            cand = str(u.get("username") or "").strip()
            if cand:
                username = cand
                break
        if not username:
            _INTERNAL_SESSION["sid"] = ""
            _INTERNAL_SESSION["exp"] = 0.0
            return None

        sid, exp = _make_session(username)
        _INTERNAL_SESSION["sid"] = sid
        _INTERNAL_SESSION["exp"] = float(exp)
        return sid


def _internal_auth_headers() -> dict[str, str]:
    sid = _internal_session_cookie()
    if not sid:
        return {}
    return {"Cookie": f"{SESSION_COOKIE}={sid}"}


def auth_status(handler: BaseHTTPRequestHandler) -> dict:
    with _AUTH_LOCK:
        auth = _read_auth()
    users = auth.get("users") if isinstance(auth.get("users"), list) else []
    needs_setup = len(users) == 0
    user = current_user(handler)
    return {"ok": True, "authed": bool(user), "user": user, "needs_setup": needs_setup, "time": _now_iso()}


_KEYBOARD_LAYOUTS_ALLOWED = {"gb", "us", "fr", "be", "de"}


def _read_kbd_kv(path: str, key: str) -> str:
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                raw = line.strip()
                if not raw or raw.startswith("#"):
                    continue
                if not raw.startswith(f"{key}="):
                    continue
                val = raw.split("=", 1)[1].strip()
                if val.startswith('"') and val.endswith('"') and len(val) >= 2:
                    val = val[1:-1]
                return str(val).strip()
    except Exception:
        return ""
    return ""


def keyboard_layout_get(handler: BaseHTTPRequestHandler) -> dict:
    layout = _read_kbd_kv("/etc/default/keyboard", "XKBLAYOUT") or ""
    layout = layout.strip().lower()
    if layout == "uk":
        layout = "gb"
    if layout not in _KEYBOARD_LAYOUTS_ALLOWED:
        layout = "us"
    status = auth_status(handler)
    return {"ok": True, "layout": layout, "needs_setup": bool(status.get("needs_setup")), "time": _now_iso()}


def keyboard_layout_set(handler: BaseHTTPRequestHandler, body: dict) -> dict:
    raw = str(body.get("layout") or "").strip().lower()
    if raw == "uk":
        raw = "gb"
    if raw not in _KEYBOARD_LAYOUTS_ALLOWED:
        return {"ok": False, "error": "invalid layout"}

    model = _read_kbd_kv("/etc/default/keyboard", "XKBMODEL") or "pc105"
    variant = _read_kbd_kv("/etc/default/keyboard", "XKBVARIANT") or ""
    options = _read_kbd_kv("/etc/default/keyboard", "XKBOPTIONS") or ""

    try:
        os.makedirs("/etc/default", exist_ok=True)
        content = (
            "# KEYBOARD CONFIGURATION FILE\n\n"
            "# Consult the keyboard(5) manual page.\n\n"
            f'XKBMODEL="{model}"\n'
            f'XKBLAYOUT="{raw}"\n'
            f'XKBVARIANT="{variant}"\n'
            f'XKBOPTIONS="{options}"\n\n'
            'BACKSPACE="guess"\n'
        )
        _write_text_atomic("/etc/default/keyboard", content)
    except Exception as e:
        return {"ok": False, "error": str(e)}

    # Best-effort apply to console + X11.
    if os.path.isfile("/usr/bin/setupcon") or os.path.isfile("/bin/setupcon"):
        run_cmd(["setupcon", "-f", "--force"], timeout_s=15)
    if os.path.isfile("/usr/bin/localectl"):
        run_cmd(["localectl", "set-x11-keymap", raw, model], timeout_s=10)

    status = auth_status(handler)
    return {"ok": True, "layout": raw, "needs_setup": bool(status.get("needs_setup")), "time": _now_iso()}


def _make_session(username: str) -> tuple[str, float]:
    sid = secrets.token_urlsafe(32)
    exp = time.time() + float(SESSION_TTL_S)
    _SESSIONS[sid] = {"user": username, "expires": exp, "created": _now_iso()}
    return sid, exp


def _set_cookie_header(value: str, *, max_age: int) -> str:
    parts = [f"{SESSION_COOKIE}={value}", "Path=/", f"Max-Age={int(max_age)}", "HttpOnly", "SameSite=Lax"]
    return "; ".join(parts)


def handle_login(handler: BaseHTTPRequestHandler, body: dict) -> tuple[int, dict, list[tuple[str, str]] | None]:
    username = _normalize_username(str(body.get("username") or ""))
    password = str(body.get("password") or "")

    with _AUTH_LOCK:
        auth = _read_auth()
        users = auth.get("users") if isinstance(auth.get("users"), list) else []
        if not users:
            return (
                HTTPStatus.PRECONDITION_REQUIRED,
                {"ok": False, "error": "setup required", "needs_setup": True},
                None,
            )

        match = None
        for u in users:
            if not isinstance(u, dict):
                continue
            if _normalize_username(str(u.get("username") or "")) == username:
                match = u
                break

        if not match:
            return HTTPStatus.UNAUTHORIZED, {"ok": False, "error": "invalid credentials"}, None

        salt = str(match.get("salt") or "")
        pw_hash = str(match.get("hash") or "")
        if not _verify_password(password, salt_b64=salt, hash_b64=pw_hash):
            return HTTPStatus.UNAUTHORIZED, {"ok": False, "error": "invalid credentials"}, None

        sid, _ = _make_session(username)

    return HTTPStatus.OK, {"ok": True, "user": username}, [("Set-Cookie", _set_cookie_header(sid, max_age=SESSION_TTL_S))]


def handle_setup(handler: BaseHTTPRequestHandler, body: dict) -> tuple[int, dict, list[tuple[str, str]] | None]:
    username = _normalize_username(str(body.get("username") or "admin"))
    password = str(body.get("password") or "")

    if err := _validate_username(username):
        return HTTPStatus.BAD_REQUEST, {"ok": False, "error": err}, None
    if len(password) < 10:
        return HTTPStatus.BAD_REQUEST, {"ok": False, "error": "Password must be at least 10 characters."}, None

    with _AUTH_LOCK:
        auth = _read_auth()
        users = auth.get("users") if isinstance(auth.get("users"), list) else []
        if users:
            return HTTPStatus.CONFLICT, {"ok": False, "error": "already configured"}, None

        salt, pw_hash = _hash_password(password)
        auth["users"] = [
            {
                "username": username,
                "salt": salt,
                "hash": pw_hash,
                "roles": ["admin"],
                "created_at": _now_iso(),
            }
        ]
        _write_auth(auth)
        sid, _ = _make_session(username)

    return HTTPStatus.OK, {"ok": True, "user": username, "created": True}, [("Set-Cookie", _set_cookie_header(sid, max_age=SESSION_TTL_S))]


def handle_logout(handler: BaseHTTPRequestHandler) -> tuple[int, dict, list[tuple[str, str]] | None]:
    sid = _cookie_map(handler).get(SESSION_COOKIE) or ""
    with _AUTH_LOCK:
        if sid:
            _SESSIONS.pop(sid, None)
    return HTTPStatus.OK, {"ok": True}, [("Set-Cookie", _set_cookie_header("", max_age=0))]


def handle_update_credentials(
    handler: BaseHTTPRequestHandler, body: dict
) -> tuple[int, dict, list[tuple[str, str]] | None]:
    if not isinstance(body, dict):
        return HTTPStatus.BAD_REQUEST, {"ok": False, "error": "invalid body"}, None

    user = current_user(handler)
    if not user:
        return HTTPStatus.UNAUTHORIZED, {"ok": False, "error": "unauthorized"}, None

    username = _normalize_username(str(body.get("username") or user))
    password = str(body.get("password") or "")

    if err := _validate_username(username):
        return HTTPStatus.BAD_REQUEST, {"ok": False, "error": err}, None

    with _AUTH_LOCK:
        auth = _read_auth()
        users = auth.get("users") if isinstance(auth.get("users"), list) else []
        if not users:
            return HTTPStatus.PRECONDITION_REQUIRED, {"ok": False, "error": "setup required"}, None

        current = None
        for u in users:
            if not isinstance(u, dict):
                continue
            if _normalize_username(str(u.get("username") or "")) == _normalize_username(user):
                current = u
                break
        if not current:
            return HTTPStatus.UNAUTHORIZED, {"ok": False, "error": "user not found"}, None

        if password:
            if len(password.strip()) < 10:
                return HTTPStatus.BAD_REQUEST, {"ok": False, "error": "Password must be at least 10 characters."}, None
            salt, pw_hash = _hash_password(password)
        else:
            salt = str(current.get("salt") or "")
            pw_hash = str(current.get("hash") or "")

        updated = {
            "username": username,
            "salt": salt,
            "hash": pw_hash,
            "roles": list(current.get("roles") or ["admin"]),
            "created_at": str(current.get("created_at") or _now_iso()),
            "updated_at": _now_iso(),
        }

        auth["users"] = [updated]
        _write_auth(auth)
        _SESSIONS.clear()
        sid, _ = _make_session(username)

    return HTTPStatus.OK, {"ok": True, "user": username}, [("Set-Cookie", _set_cookie_header(sid, max_age=SESSION_TTL_S))]


def list_installed_app_ids() -> list[str]:
    ids: list[str] = []
    if os.path.isdir(APPS_DIR):
        for name in sorted(os.listdir(APPS_DIR)):
            path = os.path.join(APPS_DIR, name)
            if not os.path.isdir(path):
                continue
            compose_path = os.path.join(path, "docker-compose.yml")
            if not os.path.isfile(compose_path):
                continue
            ids.append(name)
    return ids


def _installed_registry_read() -> dict:
    obj = _read_json(INSTALLED_APPS_FILE)
    return obj if isinstance(obj, dict) else {}


def _installed_registry_write(obj: dict) -> None:
    _write_json_atomic(INSTALLED_APPS_FILE, obj if isinstance(obj, dict) else {})
    try:
        os.chmod(INSTALLED_APPS_FILE, 0o600)
    except Exception:
        pass


def _installed_registry_bootstrap() -> None:
    """
    Ensure the installed-app registry exists and is populated from APPS_DIR.

    This registry is used as a safety signal for storage/orphan cleanup so
    data isn't misclassified as orphan if app definitions temporarily vanish.
    """
    try:
        obj = _installed_registry_read()
        apps = obj.get("apps") if isinstance(obj, dict) else None
        if not isinstance(apps, dict):
            apps = {}
        now = _now_iso()
        changed = False
        for aid in list_installed_app_ids():
            if aid not in apps or not isinstance(apps.get(aid), dict):
                apps[aid] = {"installed": True, "updated_at": now}
                changed = True
            else:
                if bool(apps[aid].get("installed")) is not True:
                    apps[aid]["installed"] = True
                    apps[aid]["updated_at"] = now
                    changed = True
        if changed or not os.path.isfile(INSTALLED_APPS_FILE):
            _installed_registry_write({"ok": True, "time": now, "apps": apps})
    except Exception:
        pass


def _installed_registry_set(app_id: str, installed: bool) -> None:
    aid = (app_id or "").strip().lower()
    if not aid:
        return
    try:
        obj = _installed_registry_read()
        apps = obj.get("apps") if isinstance(obj, dict) else None
        if not isinstance(apps, dict):
            apps = {}
        now = _now_iso()
        current = apps.get(aid) if isinstance(apps.get(aid), dict) else {}
        if not isinstance(current, dict):
            current = {}
        current["installed"] = bool(installed)
        current["updated_at"] = now
        apps[aid] = current
        _installed_registry_write({"ok": True, "time": now, "apps": apps})
    except Exception:
        pass


def _installed_registry_update_meta(app_id: str, meta: dict) -> None:
    aid = (app_id or "").strip().lower()
    if not aid or not isinstance(meta, dict):
        return
    try:
        obj = _installed_registry_read()
        apps = obj.get("apps") if isinstance(obj, dict) else None
        if not isinstance(apps, dict):
            apps = {}
        current = apps.get(aid) if isinstance(apps.get(aid), dict) else {}
        if not isinstance(current, dict):
            current = {}
        for k, v in meta.items():
            key = str(k or "").strip()
            if not key:
                continue
            current[key] = v
        current["updated_at"] = _now_iso()
        apps[aid] = current
        _installed_registry_write({"ok": True, "time": _now_iso(), "apps": apps})
    except Exception:
        pass


def _store_channel_for_app_action(app_id: str, requested: str | None = None) -> str | None:
    aid = (app_id or "").strip().lower()
    if not aid:
        return None
    allowed = allowed_store_channels()
    candidates: list[str] = []
    req = (requested or "").strip().lower()
    if req and req in allowed:
        candidates.append(req)

    install_meta = read_app_install_meta(aid)
    meta_ch = str(install_meta.get("channel") or "").strip().lower()
    if meta_ch and meta_ch in allowed and meta_ch not in candidates:
        candidates.append(meta_ch)

    sys_ch = str(read_default_channel() or "").strip().lower()
    if sys_ch and sys_ch in allowed and sys_ch not in candidates:
        candidates.append(sys_ch)

    # Prefer global next (Fix App should work for Tailscale, etc.).
    if "global" in allowed and "global" not in candidates:
        candidates.append("global")

    for ch in sorted(allowed):
        if ch not in candidates:
            candidates.append(ch)

    for ch in candidates:
        meta = store_app_by_id_in_channel(aid, ch)
        if isinstance(meta, dict) and meta.get("installable") is True:
            return ch
    return None


def _update_app_install_meta_channel(app_id: str, channel: str | None) -> None:
    aid = (app_id or "").strip().lower()
    ch = (channel or "").strip().lower()
    if not aid or not ch:
        return
    try:
        base = Path(APPS_DIR) / aid
        base.mkdir(parents=True, exist_ok=True)
        path = base / "5tratumos.json"
        current = read_app_install_meta(aid)
        if not isinstance(current, dict):
            current = {}
        current["channel"] = ch
        store_meta = store_app_by_id_in_channel(aid, ch)
        if isinstance(store_meta, dict):
            sid = str(store_meta.get("store_id") or store_meta.get("id") or "").strip()
            if sid:
                current["store_id"] = sid
        path.write_text(json.dumps(current, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")
        try:
            os.chmod(str(path), 0o600)
        except Exception:
            pass
    except Exception:
        pass


def _installed_registry_installed_set() -> set[str]:
    out: set[str] = set()
    obj = _installed_registry_read()
    apps = obj.get("apps") if isinstance(obj, dict) else None
    if not isinstance(apps, dict):
        return out
    for k, v in apps.items():
        aid = str(k or "").strip().lower()
        if not aid:
            continue
        if isinstance(v, dict) and bool(v.get("installed")):
            out.add(aid)
    return out


def read_default_channel() -> str:
    env_ch = (os.environ.get("FIVETRATUMOS_CHANNEL") or _env("CHANNEL", "") or "").strip().lower()
    if env_ch in {"main", "dev"}:
        return env_ch
    try:
        raw = Path(CHANNEL_FILE).read_text(encoding="utf-8")
    except Exception:
        return "main"
    ch = raw.strip().lower()
    return ch if ch in {"main", "dev"} else "main"


def system_channel_get() -> dict:
    host = socket.gethostname()
    return {"ok": True, "channel": read_default_channel(), "hostname": host}


def system_channel_set(body: dict) -> dict:
    if not isinstance(body, dict):
        return {"ok": False, "error": "invalid body"}
    channel = str(body.get("channel") or body.get("value") or "").strip().lower()
    if channel not in {"main", "dev"}:
        return {"ok": False, "error": "invalid channel"}
    try:
        Path(CHANNEL_FILE).parent.mkdir(parents=True, exist_ok=True)
        Path(CHANNEL_FILE).write_text(f"{channel}\n", encoding="utf-8")
    except Exception as e:
        return {"ok": False, "error": f"failed to set channel: {e}"}
    return {"ok": True, "channel": read_default_channel()}


def os_update_check() -> dict:
    proc = run_cmd(["/usr/bin/apt-get", "update"], timeout_s=300)
    if proc.returncode != 0:
        return {
            "ok": False,
            "error": (proc.stderr or proc.stdout or "apt update failed").strip(),
        }
    upgradable = 0
    proc = run_cmd(["/usr/bin/apt", "list", "--upgradable"], timeout_s=120)
    if proc.returncode == 0:
        lines = [ln.strip() for ln in proc.stdout.splitlines()]
        for ln in lines:
            if not ln or ln.lower().startswith("listing"):
                continue
            upgradable += 1
    reboot_required = os.path.exists("/var/run/reboot-required")
    return {"ok": True, "upgradable": upgradable, "reboot_required": reboot_required}


def os_update_apply() -> dict:
    proc = run_cmd(["/usr/bin/apt-get", "upgrade", "-y"], timeout_s=3600)
    if proc.returncode != 0:
        return {
            "ok": False,
            "error": (proc.stderr or proc.stdout or "apt upgrade failed").strip(),
        }
    reboot_required = os.path.exists("/var/run/reboot-required")
    return {"ok": True, "reboot_required": reboot_required}


def _safe_str(value: object) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    return str(value)


def _safe_str_list(value: object) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        out: list[str] = []
        for item in value:
            s = _safe_str(item).strip()
            if s:
                out.append(s)
        return out
    if isinstance(value, tuple):
        return [_safe_str(v).strip() for v in value if _safe_str(v).strip()]
    s = _safe_str(value).strip()
    return [s] if s else []


_STORE_ID_PREFIXES = ("willitmod-dev-", "willitmod-")


def map_store_id_to_app_id(store_id: str, channel: str) -> str:
    raw = (store_id or "").strip().lower()
    ch = (channel or "").strip().lower()

    # Global/custom stores use canonical IDs like "bitcoin", "nextcloud", etc.
    if ch == "global" or ch.startswith("custom"):
        raw = raw.replace(" ", "-")
        raw = re.sub(r"[^a-z0-9_-]+", "", raw)
        return raw or "app"

    for prefix in _STORE_ID_PREFIXES:
        if raw.startswith(prefix):
            raw = raw[len(prefix) :]
            break
    raw = raw.replace("_", "").replace("-", "")
    if not raw.startswith("axe"):
        raw = f"axe{raw}"
    return raw


def store_asset_url(channel: str, app_dir_name: str, filename: str) -> str:
    ch = (channel or "main").strip().lower() or "main"
    name = app_dir_name.strip("/")
    fn = filename.strip("/").replace("\\", "/")
    return f"/store/{ch}/{name}/{fn}"


def _is_remote_url(value: str) -> bool:
    try:
        u = urlparse(value)
    except Exception:
        return False
    return u.scheme in {"http", "https"}


def _global_store_raw_url(app_dir_name: str, filename: str) -> str:
    repo = (GLOBAL_STORE_REPO or "WillItMod/global-apps").strip().strip("/")
    branch = (GLOBAL_STORE_BRANCH or "master").strip().strip("/")
    name = (app_dir_name or "").strip().strip("/")
    fn = (filename or "").strip().lstrip("/").replace("\\", "/")
    return f"https://raw.githubusercontent.com/{repo}/{branch}/{name}/{fn}"


def _global_assets_raw_url(app_dir_name: str, filename: str) -> str:
    name = (app_dir_name or "").strip().strip("/")
    fn = (filename or "").strip().lstrip("/").replace("\\", "/")
    if name and fn:
        local = Path(STORE_DIR) / "global-assets" / name / fn
        if local.is_file():
            return store_asset_url("global-assets", name, fn)
    repo = (GLOBAL_ASSETS_REPO or "").strip().strip("/")
    branch = (GLOBAL_ASSETS_BRANCH or "master").strip().strip("/")
    if not repo:
        return ""
    return f"https://raw.githubusercontent.com/{repo}/{branch}/{name}/{fn}"


def _prefer_local_icon(channel: str, app_dir_path: Path, app_dir_name: str, manifest_icon: str) -> str:
    for fn in ("logo.png", "logo.jpg", "logo.jpeg", "logo.svg", "icon.png", "icon.jpg", "icon.jpeg", "icon.svg"):
        if (app_dir_path / fn).is_file():
            return store_asset_url(channel, app_dir_name, fn)
    mi = (manifest_icon or "").strip()
    if mi and _is_remote_url(mi):
        localized = _maybe_localize_store_url(channel, app_dir_path, app_dir_name, mi)
        if localized and localized != mi:
            return localized
        return mi
    if mi and not _is_remote_url(mi):
        rel = mi.lstrip("/").replace("\\", "/")
        if rel and (app_dir_path / rel).is_file():
            return store_asset_url(channel, app_dir_name, rel)

    ch = (channel or "").strip().lower()
    if ch == "global":
        if mi:
            if _is_remote_url(mi):
                return mi
            rel = mi.lstrip("/").replace("\\", "/")
            if rel:
                return _global_assets_raw_url(app_dir_name, rel) or _global_store_raw_url(app_dir_name, rel)
        # Global store recipes may not ship gallery/icon files in-repo; prefer the assets repo.
        for fn in ("icon.svg", "icon.png", "logo.svg", "logo.png", "logo.jpg", "icon.jpg", "logo.jpeg", "icon.jpeg"):
            return _global_assets_raw_url(app_dir_name, fn) or _global_store_raw_url(app_dir_name, fn)

    return manifest_icon


def _maybe_localize_store_url(channel: str, app_dir_path: Path, app_dir_name: str, value: str) -> str:
    raw = (value or "").strip()
    if not raw:
        return raw

    try:
        u = urlparse(raw)
    except Exception:
        u = None

    if u and u.scheme in {"http", "https"}:
        marker = f"/{app_dir_name}/"
        idx = u.path.find(marker)
        if idx >= 0:
            rel = u.path[idx + len(marker) :].lstrip("/").replace("\\", "/")
            if rel and (app_dir_path / rel).is_file():
                return store_asset_url(channel, app_dir_name, rel)

        fn = Path(u.path).name
        for base in ("images", "screenshots", "gallery", ""):
            rel = f"{base}/{fn}".strip("/")
            if fn and rel and (app_dir_path / rel).is_file():
                return store_asset_url(channel, app_dir_name, rel)
        return raw

    # Relative path
    path = (u.path if u else raw).lstrip("/").replace("\\", "/")
    if path and (app_dir_path / path).is_file():
        return store_asset_url(channel, app_dir_name, path)
    fn = Path(path).name
    for base in ("images", "screenshots", "gallery", ""):
        rel = f"{base}/{fn}".strip("/")
        if fn and rel and (app_dir_path / rel).is_file():
            return store_asset_url(channel, app_dir_name, rel)

    ch = (channel or "").strip().lower()
    if ch == "global" and path and not _is_remote_url(raw):
        # Global store manifests commonly reference "1.jpg" etc. Prefer assets repo + gallery paths.
        ext = Path(path).suffix.lower()
        if "/" not in path and ext in {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}:
            return (
                _global_assets_raw_url(app_dir_name, path)
                or _global_assets_raw_url(app_dir_name, f"gallery/{path}")
                or _global_store_raw_url(app_dir_name, path)
                or _global_store_raw_url(app_dir_name, f"gallery/{path}")
            )
        return (
            _global_assets_raw_url(app_dir_name, path)
            or _global_store_raw_url(app_dir_name, path)
            or _global_assets_raw_url(app_dir_name, f"gallery/{path}")
            or _global_store_raw_url(app_dir_name, f"gallery/{path}")
        )

    return raw


def _prefer_local_gallery(channel: str, app_dir_path: Path, app_dir_name: str, manifest_gallery: list[str]) -> list[str]:
    if not manifest_gallery:
        candidates: list[str] = []
        image_exts = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
        for base in ("images", "screenshots", "gallery"):
            subdir = app_dir_path / base
            if not subdir.is_dir():
                continue
            for p in sorted(subdir.iterdir(), key=lambda it: it.name):
                if not p.is_file():
                    continue
                if p.suffix.lower() not in image_exts:
                    continue
                candidates.append(f"{base}/{p.name}")

        for p in sorted(app_dir_path.iterdir(), key=lambda it: it.name):
            if not p.is_file():
                continue
            if p.suffix.lower() not in image_exts:
                continue
            low = p.name.lower()
            if low.startswith("icon.") or low.startswith("logo."):
                continue
            candidates.append(p.name)

        return [store_asset_url(channel, app_dir_name, fn) for fn in candidates]

    out: list[str] = []
    for item in manifest_gallery:
        out.append(_maybe_localize_store_url(channel, app_dir_path, app_dir_name, item))
    return out


_STORE_CACHE: dict[str, dict] = {}
_WIDGET_CACHE: dict[str, dict] = {}
_FLEET_CACHE: dict[str, dict] = {}


def _has_pool_widget(store_meta: dict) -> bool:
    widgets = store_meta.get("widgets")
    if not isinstance(widgets, list):
        return False
    for item in widgets:
        if not isinstance(item, dict):
            continue
        if str(item.get("id") or "").strip().lower() == "pool":
            return True
    return False


def list_store_apps(channel: str | None) -> dict:
    ch = (channel or read_default_channel()).strip().lower() or "main"
    if ch not in allowed_store_channels():
        store_root = Path(STORE_DIR) / ch
        if not store_root.is_dir():
            return {"ok": False, "error": f"invalid channel: {ch}", "channel": ch, "apps": []}

    if yaml is None:
        return {"ok": False, "error": "pyyaml not installed", "channel": ch, "apps": []}

    cache = _STORE_CACHE.get(ch) or {}
    now = time.time()
    if cache.get("time") and now - float(cache.get("time") or 0) < 20:
        return {"ok": True, "channel": ch, "apps": cache.get("apps") or []}

    store_root = Path(STORE_DIR) / ch
    if not store_root.is_dir():
        return {"ok": False, "error": f"store not found: {store_root}", "channel": ch, "apps": []}

    templates_root = Path(ROOT_DIR) / "apps-available" / ch
    apps: list[dict] = []

    for entry in sorted(store_root.iterdir(), key=lambda p: p.name):
        if not entry.is_dir():
            continue
        if entry.name.startswith("."):
            continue
        manifest_path = entry / "global-app.yml"
        if not manifest_path.is_file():
            continue

        try:
            with manifest_path.open("r", encoding="utf-8") as f:
                manifest = yaml.safe_load(f) or {}
        except Exception:
            continue

        store_id = _safe_str(manifest.get("id") or entry.name).strip()
        app_id = map_store_id_to_app_id(store_id, ch)

        installable = (templates_root / app_id / "docker-compose.yml").is_file() or (entry / "docker-compose.yml").is_file()

        deps_raw = manifest.get("dependencies")
        if deps_raw is None:
            deps_raw = manifest.get("depends_on")
        if deps_raw is None:
            deps_raw = manifest.get("requires")
        deps = []
        if isinstance(deps_raw, list):
            deps = [_safe_str(v).strip() for v in deps_raw]
        elif isinstance(deps_raw, str):
            deps = [v.strip() for v in deps_raw.replace(",", " ").split() if v.strip()]
        deps = [map_store_id_to_app_id(d, ch) for d in deps if d]
        deps_out = []
        seen_dep = set()
        for d in deps:
            key = str(d or "").strip().lower()
            if not key or key == app_id:
                continue
            if key in seen_dep:
                continue
            seen_dep.add(key)
            deps_out.append(key)

        manifest_icon = _safe_str(manifest.get("icon")).strip()
        manifest_gallery = _safe_str_list(manifest.get("gallery"))
        icon_url = _prefer_local_icon(ch, entry, entry.name, manifest_icon)
        gallery_urls = _prefer_local_gallery(ch, entry, entry.name, manifest_gallery)

        widgets_out: list[dict] = []
        widgets_raw = manifest.get("widgets")
        if isinstance(widgets_raw, list):
            for item in widgets_raw:
                if not isinstance(item, dict):
                    continue
                widget = {
                    "id": _safe_str(item.get("id")).strip(),
                    "type": _safe_str(item.get("type")).strip(),
                    "refresh": _safe_str(item.get("refresh")).strip(),
                    "endpoint": _safe_str(item.get("endpoint")).strip(),
                    "link": _safe_str(item.get("link")).strip(),
                }
                example = item.get("example")
                if isinstance(example, dict):
                    widget["example"] = example
                widgets_out.append(widget)

        apps.append(
            {
                "id": app_id,
                "store_id": store_id,
                "channel": ch,
                "dir": entry.name,
                "name": _safe_str(manifest.get("name") or app_id).strip() or app_id,
                "tagline": _safe_str(manifest.get("tagline")).strip(),
                "description": _safe_str(manifest.get("description")).strip(),
                "version": _safe_str(manifest.get("version")).strip(),
                "category": _safe_str(manifest.get("category")).strip(),
                "developer": _safe_str(manifest.get("developer")).strip(),
                "website": _safe_str(manifest.get("website")).strip(),
                "repo": _safe_str(manifest.get("repo")).strip(),
                "support": _safe_str(manifest.get("support")).strip(),
                "icon": icon_url,
                "gallery": gallery_urls,
                "port": manifest.get("port"),
                "path": _safe_str(manifest.get("path")).strip(),
                "widgets": widgets_out,
                "dependencies": deps_out,
                "installable": bool(installable),
            }
        )

    if ch in {"main", "dev"}:
        if not any(str(a.get("id") or "").strip().lower() == "axedoom" for a in apps):
            portal_assets = Path(ROOT_DIR) / "overlay" / "portal" / "assets"
            doom_icon = ""
            if (portal_assets / "doom_original.webp").is_file():
                doom_icon = "/assets/doom_original.webp"
            elif (portal_assets / "doom_original.png").is_file():
                doom_icon = "/assets/doom_original.png"
            elif (portal_assets / "doom.webp").is_file():
                doom_icon = "/assets/doom.webp"
            apps.append(
                {
                    "id": "axedoom",
                    "store_id": "axedoom",
                    "channel": "main",
                    "dir": "__builtin__",
                    "name": "AxeDoom",
                    "tagline": "Play Doom in your browser (Freedoom)",
                    "description": "Optional install. Runs Chocolate Doom with the open-source Freedoom IWAD via a web-based noVNC session.",
                    "version": "1.0.0",
                    "category": "Fun",
                    "developer": "5tratumOS",
                    "website": "https://freedoom.github.io/",
                    "repo": "",
                    "support": "",
                    "icon": doom_icon,
                    "gallery": [],
                    "port": 5300,
                    "path": "",
                    "widgets": [],
                    "dependencies": [],
                    "installable": True,
                }
            )

    _STORE_CACHE[ch] = {"time": now, "apps": apps}
    return {"ok": True, "channel": ch, "apps": apps}


def store_app_by_id(app_id: str) -> dict | None:
    app_id = (app_id or "").strip().lower()
    if not app_id:
        return None
    for ch in allowed_store_channels():
        res = list_store_apps(ch)
        if not res.get("ok"):
            continue
        for app in res.get("apps") or []:
            if str(app.get("id") or "").strip().lower() == app_id:
                return app
    return None


def store_app_by_id_in_channel(app_id: str, channel: str) -> dict | None:
    app_id = (app_id or "").strip().lower()
    ch = (channel or "").strip().lower()
    if not app_id or ch not in allowed_store_channels():
        return None
    res = list_store_apps(ch)
    if not res.get("ok"):
        return None
    for app in res.get("apps") or []:
        if str(app.get("id") or "").strip().lower() == app_id:
            return app
    return None


def read_app_install_meta(app_id: str) -> dict:
    base = Path(APPS_DIR) / app_id
    new_path = base / "5tratumos.json"
    legacy_path = base / f"{_legacy_brand()}.json"
    path = new_path if new_path.is_file() else legacy_path
    if not path.is_file():
        return {}
    try:
        obj = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}
    if isinstance(obj, dict) and path == legacy_path and not new_path.exists():
        try:
            new_path.write_text(json.dumps(obj, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")
        except Exception:
            pass
    return obj if isinstance(obj, dict) else {}


_VERSION_RE = re.compile(r"^\s*v?(\d+(?:\.\d+)*)(?:[-+](.*))?\s*$")


def _version_key(value: str) -> tuple[tuple[int, ...], int, str]:
    raw = (value or "").strip()
    if not raw:
        return (0, 0, 0), 0, ""
    m = _VERSION_RE.match(raw)
    if not m:
        return (0, 0, 0), 0, raw.lower()
    nums = tuple(int(p) for p in m.group(1).split(".") if p.isdigit())
    nums = (nums + (0, 0, 0))[:3]
    suffix = (m.group(2) or "").strip().lower()
    if not suffix:
        rank = 5
    elif suffix.startswith("rc"):
        rank = 4
    elif "beta" in suffix:
        rank = 3
    elif "alpha" in suffix:
        rank = 2
    elif "dev" in suffix:
        rank = 1
    else:
        rank = 1
    return nums, rank, suffix


def is_update_available(installed: str, latest: str) -> bool:
    inst = (installed or "").strip()
    lat = (latest or "").strip()
    if not inst or not lat:
        return False
    return _version_key(inst) < _version_key(lat)


def _image_tag(value: str) -> str:
    raw = (value or "").strip()
    if not raw:
        return ""
    base = raw.split("@", 1)[0]
    idx = base.rfind(":")
    if idx <= base.rfind("/"):
        return ""
    tag = base[idx + 1 :].strip()
    if not tag or tag.lower() == "latest":
        return ""
    return tag


def infer_installed_version(project: str, containers: list[dict]) -> str:
    proj = (project or "").strip()
    if not proj:
        return ""

    def norm_name(v: object) -> str:
        s = str(v or "").strip()
        return s[1:] if s.startswith("/") else s

    preferred = [f"{proj}-app", f"{proj}-server", f"{proj}-web", f"{proj}-ui"]
    prefix = f"{proj}-"

    for pref in preferred:
        for c in containers:
            name = norm_name(c.get("Names") or c.get("Name") or "")
            if not name or not name.startswith(pref):
                continue
            tag = _image_tag(str(c.get("Image") or ""))
            if tag:
                return tag

    for c in containers:
        name = norm_name(c.get("Names") or c.get("Name") or "")
        if not name or not name.startswith(prefix):
            continue
        tag = _image_tag(str(c.get("Image") or ""))
        if tag:
            return tag

    return ""


def _widget_endpoint_path(endpoint: str) -> str:
    raw = (endpoint or "").strip()
    if not raw:
        return ""
    if raw.startswith("/"):
        return raw
    if "://" in raw:
        try:
            u = urlparse(raw)
        except Exception:
            return ""
        path = u.path or "/"
        if u.query:
            path = f"{path}?{u.query}"
        return path
    if "/" not in raw:
        return ""
    _, rest = raw.split("/", 1)
    return f"/{rest}"


def _fetch_json(
    url: str,
    *,
    timeout_s: int = 2,
    headers: dict[str, str] | None = None,
) -> dict | list | str | int | float | bool | None:
    hdrs = {"Accept": "application/json"}
    if headers:
        hdrs.update({str(k): str(v) for k, v in headers.items()})
    req = urllib.request.Request(url, headers=hdrs)
    with urllib.request.urlopen(req, timeout=timeout_s) as resp:  # noqa: S310
        raw = resp.read().decode("utf-8", errors="replace")
    return json.loads(raw)


def list_app_widgets() -> dict:
    cache = _WIDGET_CACHE.get("widgets") or {}
    now = time.time()
    if cache.get("time") and now - float(cache.get("time") or 0) < 3:
        return {"ok": True, "time": _now_iso(), "apps": cache.get("apps") or []}

    apps_out: list[dict] = []
    widget_tasks: list[tuple[concurrent.futures.Future, dict]] = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        for app_id in list_installed_app_ids():
            store_meta = store_app_by_id(app_id) or {}
            widgets = store_meta.get("widgets") or []
            if not isinstance(widgets, list) or not widgets:
                continue

            port = _store_port(store_meta)

            project = docker_compose_project(app_id)
            st = summarize_project_status(project)
            status = str(st.get("status") or "unknown")

            app_entry = {
                "id": app_id,
                "name": str(store_meta.get("name") or app_id),
                "status": status,
                "port": port,
                "widgets": [],
            }

            fetchable = status == "running" and port is not None

            for item in widgets[:8]:
                if not isinstance(item, dict):
                    continue
                endpoint = _safe_str(item.get("endpoint")).strip()
                w = {
                    "id": _safe_str(item.get("id")).strip(),
                    "type": _safe_str(item.get("type")).strip(),
                    "endpoint": endpoint,
                    "refresh": _safe_str(item.get("refresh")).strip(),
                    "ok": False,
                }
                path = _widget_endpoint_path(endpoint)
                if not fetchable or not path:
                    w["error"] = "not running" if status != "running" else "missing endpoint"
                    app_entry["widgets"].append(w)
                    continue
                url = f"http://127.0.0.1:{port}{path}"
                # Keep widget aggregation snappy; use short timeouts and return partial results.
                # Keep widget aggregation snappy; use short timeouts and return partial results.
                fut = pool.submit(_fetch_json, url, timeout_s=2, headers=_internal_auth_headers())
                widget_tasks.append((fut, w))
                app_entry["widgets"].append(w)

            apps_out.append(app_entry)

        if widget_tasks:
            done, pending = concurrent.futures.wait(
                [t[0] for t in widget_tasks],
                timeout=2.7,
                return_when=concurrent.futures.ALL_COMPLETED,
            )
            for fut, widget in widget_tasks:
                if fut in done:
                    try:
                        widget["data"] = fut.result()
                        widget["ok"] = True
                    except Exception as e:
                        widget["error"] = str(e)
                else:
                    widget["error"] = "timeout"
                    fut.cancel()

    _WIDGET_CACHE["widgets"] = {"time": now, "apps": apps_out}
    return {"ok": True, "time": _now_iso(), "apps": apps_out}


def axe_fleet_summary(*, limit_workers: int | None = None) -> dict:
    now = time.time()
    limit = int(limit_workers or 0)
    cache = _FLEET_CACHE.get("summary") or {}
    if cache.get("time") and now - float(cache.get("time") or 0) < 3 and int(cache.get("limit") or 0) == limit:
        data = cache.get("data") or {}
        if isinstance(data, dict) and data.get("ok") is True:
            return data

    pools: list[dict] = []
    workers_out: list[dict] = []
    total_hashrate_ths = 0.0
    total_workers = 0

    last_good: dict | None = None
    if isinstance(cache.get("data"), dict) and (cache.get("data") or {}).get("ok") is True:
        last_good = cache.get("data")  # type: ignore[assignment]
    prev_pool_by_id: dict[str, dict] = {}
    if isinstance(last_good, dict) and isinstance(last_good.get("pools"), list):
        for it in last_good.get("pools") or []:
            if not isinstance(it, dict):
                continue
            pid = str(it.get("id") or "").strip().lower()
            if pid:
                prev_pool_by_id[pid] = it

    def _fetch_pool(app_id: str) -> tuple[dict, list[dict]]:
        app_id = (app_id or "").strip().lower()
        if not app_id:
            return {}, []
        if app_id not in AXE_SUITE_POOL_APP_IDS:
            return {}, []

        store_meta = store_app_by_id(app_id) or {}
        if not isinstance(store_meta, dict):
            store_meta = {}

        name = str(store_meta.get("name") or app_id).strip() or app_id
        coin = name[3:].strip().upper() if name.lower().startswith("axe") else name.strip().upper()
        if not coin:
            coin = app_id.upper()

        install_meta = read_app_install_meta(app_id)

        def _read_ui_port(meta: dict) -> int | None:
            try:
                ui = meta.get("ui") if isinstance(meta, dict) else None
                if isinstance(ui, dict):
                    p = ui.get("port")
                    if isinstance(p, int):
                        return int(p)
                    if isinstance(p, str) and p.strip().isdigit():
                        return int(p.strip())
            except Exception:
                return None
            return None

        install_port = _read_ui_port(install_meta)
        store_port = _store_port(store_meta)
        candidates = []
        for p in (install_port, store_port):
            if isinstance(p, int) and p > 0 and p not in candidates:
                candidates.append(p)

        project = docker_compose_project(app_id)
        st = summarize_project_status(project)
        status = str(st.get("status") or "unknown")

        entry: dict = {
            "id": app_id,
            "name": name,
            "coin": coin,
            "status": status,
            "port": candidates[0] if candidates else None,
            "ok": False,
        }

        if status != "running" or not candidates:
            entry["pool_error"] = "not running"
            entry["workers_error"] = "not running"
            return entry, []

        pool_data: dict | None = None
        workers_data: dict | None = None
        pool_err: str | None = None
        workers_err: str | None = None

        # AxeBTCF can be slower to respond while syncing; give it a bit more time.
        timeout_s = 4 if app_id == "axebtc" else 2

        def _try_port(port: int) -> bool:
            nonlocal pool_data, workers_data, pool_err, workers_err
            pool_url = f"http://127.0.0.1:{port}/api/pool"
            workers_url = f"http://127.0.0.1:{port}/api/pool/workers"
            pool_data = None
            workers_data = None
            pool_err = None
            workers_err = None

            try:
                pool_raw = _fetch_json(pool_url, timeout_s=timeout_s, headers=_internal_auth_headers())
                if isinstance(pool_raw, dict):
                    pool_data = pool_raw
                else:
                    pool_err = "invalid pool response"
            except Exception as e:
                pool_err = str(e)

            try:
                workers_raw = _fetch_json(workers_url, timeout_s=timeout_s, headers=_internal_auth_headers())
                if isinstance(workers_raw, dict):
                    workers_data = workers_raw
                else:
                    workers_err = "invalid workers response"
            except Exception as e:
                workers_err = str(e)

            return pool_data is not None

        chosen = None
        for p in candidates:
            if _try_port(p):
                chosen = p
                break

        entry["port"] = chosen if chosen is not None else (candidates[0] if candidates else None)
        if pool_err:
            entry["pool_error"] = pool_err
        if workers_err:
            entry["workers_error"] = workers_err

        if pool_data is not None:
            entry["pool"] = pool_data
        if workers_data is not None:
            entry["workers"] = workers_data
        entry["ok"] = pool_data is not None
        entry["sample_ok"] = entry["ok"]

        details: list[dict] = []

        def _worker_last_share_age_s(w: dict) -> float | None:
            for k in (
                "last_share_s",
                "last_share_sec",
                "last_share_seconds",
                "last_share_age_s",
                "last_share_age",
                "last_share",
                "lastshare_ago_s",
                "lastShareSec",
                "lastShareSeconds",
                "lastShare",
            ):
                try:
                    v = w.get(k)
                    if isinstance(v, (int, float)):
                        return float(v)
                    if isinstance(v, str) and v.strip():
                        return float(v.strip())
                except Exception:
                    continue
            return None

        def _worker_hashrate_ths(w: dict) -> float:
            for k in ("hashrate_ths", "hashrate_1m_ths", "hashrate_5m_ths", "hashrate"):
                try:
                    v = w.get(k)
                    if isinstance(v, (int, float)):
                        return float(v)
                    if isinstance(v, str) and v.strip():
                        return float(v.strip())
                except Exception:
                    continue
            return 0.0

        def _worker_is_stale(w: dict) -> bool:
            try:
                hr = _worker_hashrate_ths(w)
                if hr > 0:
                    return False
                age = _worker_last_share_age_s(w)
                if age is None:
                    return False
                return float(age) > float(WORKER_STALE_S)
            except Exception:
                return False

        def _parse_share_ts(v: object) -> float | None:
            if v is None:
                return None
            now_ts = time.time()
            ts: float | None = None

            if isinstance(v, (int, float)):
                ts = float(v)
            elif isinstance(v, str):
                raw = v.strip()
                if not raw:
                    return None
                if raw.isdigit():
                    try:
                        ts = float(raw)
                    except Exception:
                        ts = None
                else:
                    dt = None
                    try:
                        dt = datetime.datetime.fromisoformat(raw.replace("Z", "+00:00"))
                    except Exception:
                        dt = None
                    if dt is None:
                        for fmt in ("%Y-%m-%d %H:%M:%S", "%Y/%m/%d %H:%M:%S"):
                            try:
                                dt = datetime.datetime.strptime(raw, fmt)
                                break
                            except Exception:
                                dt = None
                    if dt is not None:
                        try:
                            ts = float(dt.replace(tzinfo=datetime.timezone.utc).timestamp())
                        except Exception:
                            ts = None

            if ts is None:
                return None
            if ts > 10_000_000_000:
                ts = ts / 1000.0
            if ts > now_ts + 60:
                return None
            if ts < 0:
                return None
            return ts

        def _normalize_worker_fields(w: dict) -> dict:
            if not isinstance(w, dict):
                return {}
            out = dict(w)

            if "workername" not in out:
                wn = out.get("worker") or out.get("workerName") or out.get("name") or out.get("id") or ""
                if wn:
                    out["workername"] = str(wn)

            if "bestshare" not in out:
                bs = (
                    out.get("bestShare")
                    or out.get("best_share")
                    or out.get("bestshare")
                    or out.get("bestShareValue")
                    or out.get("best_share_value")
                )
                if bs is not None:
                    out["bestshare"] = bs

            if "lastshare_ago_s" not in out and "last_share_ago_s" not in out:
                ls = (
                    out.get("lastshare")
                    or out.get("lastShare")
                    or out.get("last_share")
                    or out.get("lastShareTime")
                    or out.get("lastShareTimestamp")
                    or out.get("lastShareTs")
                )
                ts = _parse_share_ts(ls)
                if ts is not None:
                    out["lastshare"] = int(ts)
                    out["lastshare_ago_s"] = max(0, int(time.time() - ts))

            return out

        raw_details = None
        if workers_data:
            if isinstance(workers_data.get("workers_details"), list):
                raw_details = workers_data.get("workers_details")
            elif isinstance(workers_data.get("workers"), list):
                raw_details = workers_data.get("workers")
            elif isinstance(workers_data.get("details"), list):
                raw_details = workers_data.get("details")
            elif isinstance(workers_data.get("miners"), list):
                best_worker = ""
                best_share = None
                if isinstance(pool_data, dict):
                    bw = (
                        pool_data.get("best_share_all_worker")
                        or pool_data.get("best_share_worker")
                        or pool_data.get("best_share_worker_all_time")
                        or pool_data.get("bestShareWorker")
                        or ""
                    )
                    if isinstance(bw, str):
                        best_worker = bw.strip()
                    bs = (
                        pool_data.get("best_share_all")
                        or pool_data.get("best_share")
                        or pool_data.get("best_share_all_time")
                        or pool_data.get("bestShare")
                    )
                    if isinstance(bs, (int, float, str)):
                        best_share = bs

                normalized: list[dict] = []
                for miner in workers_data.get("miners") or []:
                    if not isinstance(miner, dict):
                        continue
                    w = _normalize_worker_fields(miner)
                    if "workername" not in w:
                        wn = w.get("worker") or w.get("workerName") or w.get("name") or ""
                        if wn:
                            w["workername"] = str(wn)
                        else:
                            w["workername"] = str(w.get("miner") or "")
                    if "hashrate_ths" not in w:
                        try:
                            hs = w.get("hashrate_hs")
                            if isinstance(hs, (int, float)):
                                w["hashrate_ths"] = float(hs) / 1e12
                            elif isinstance(hs, str) and hs.strip():
                                w["hashrate_ths"] = float(hs.strip()) / 1e12
                        except Exception:
                            pass
                    try:
                        ls = w.get("lastShare")
                        if isinstance(ls, str) and ls.strip():
                            dt = None
                            try:
                                dt = datetime.datetime.fromisoformat(ls.strip().replace("Z", "+00:00"))
                            except Exception:
                                dt = None
                            if dt is not None:
                                ts = dt.timestamp()
                                w["lastshare"] = int(ts)
                                w["lastshare_ago_s"] = max(0, int(time.time() - ts))
                    except Exception:
                        pass

                    if best_worker and best_share is not None:
                        wn = str(w.get("workername") or "").strip()
                        short = str(w.get("worker") or "").strip()
                        if wn == best_worker or short == best_worker:
                            try:
                                w["bestshare"] = int(float(best_share))
                            except Exception:
                                w["bestshare"] = best_share
                    normalized.append(w)
                raw_details = normalized

        if isinstance(raw_details, list):
            for w in raw_details:
                if not isinstance(w, dict):
                    continue
                details.append({"app_id": app_id, "coin": coin, **_normalize_worker_fields(w)})
        return entry, details

    exec_pool = concurrent.futures.ThreadPoolExecutor(max_workers=6)
    try:
        pool_app_ids = [a for a in _axesuite_installed_ids() if a in AXE_SUITE_POOL_APP_IDS]
        futures = [exec_pool.submit(_fetch_pool, app_id) for app_id in pool_app_ids]
        done, pending = concurrent.futures.wait(
            futures,
            timeout=2.8,
            return_when=concurrent.futures.ALL_COMPLETED,
        )
        for fut in done:
            try:
                entry, details = fut.result()
            except Exception:
                continue
            if not entry:
                continue
            # Prevent Fleet dips-to-zero when a pool endpoint times out.
            # If we have a last-known-good sample for this pool, reuse it and mark as stale.
            pid = str(entry.get("id") or "").strip().lower()
            if pid and pid in prev_pool_by_id:
                prev = prev_pool_by_id[pid]
                if not bool(entry.get("ok")):
                    if isinstance(prev.get("pool"), dict) and "pool" not in entry:
                        entry["pool"] = prev.get("pool")
                    if isinstance(prev.get("workers"), dict) and "workers" not in entry:
                        entry["workers"] = prev.get("workers")
                    entry["stale"] = True
                    entry["sample_ok"] = False
                    # Keep ok=true if we can show cached values in the UI.
                    entry["ok"] = bool(entry.get("pool"))
            pools.append(entry)
            if "pool" in entry and isinstance(entry.get("pool"), dict):
                pool_obj = entry["pool"]
                try:
                    hr = _pool_hashrate_ths(pool_obj)
                    if isinstance(hr, (int, float)):
                        total_hashrate_ths += float(hr)
                except Exception:
                    pass
                try:
                    w = _pool_workers(pool_obj)
                    if isinstance(w, int):
                        total_workers += int(w)
                except Exception:
                    pass
            for w in details:
                if isinstance(w, dict):
                    workers_out.append(w)
        for fut in pending:
            fut.cancel()
    finally:
        # Do not block request handling on slow/hung pool endpoints.
        try:
            exec_pool.shutdown(wait=False, cancel_futures=True)
        except TypeError:
            exec_pool.shutdown(wait=False)

    # If nothing completed (or the store is still warming up), do not emit a fake 0 dip.
    if not pools:
        if last_good is not None:
            try:
                out = dict(last_good)
                out["time"] = _now_iso()
                out["_stale"] = True
                return out
            except Exception:
                pass
        return {"ok": False, "error": "fleet poll timeout", "time": _now_iso()}

    def worker_hashrate_key(w: dict) -> float:
        for k in ("hashrate_ths", "hashrate_1m_ths", "hashrate_5m_ths", "hashrate"):
            try:
                v = w.get(k)
                if isinstance(v, (int, float)):
                    return float(v)
                if isinstance(v, str) and v.strip():
                    return float(v.strip())
            except Exception:
                continue
        return 0.0

    def worker_last_share_age_s(w: dict) -> float | None:
        for k in (
            "last_share_s",
            "last_share_sec",
            "last_share_seconds",
            "last_share_age_s",
            "last_share_age",
            "last_share",
            "lastshare_ago_s",
            "lastShareSec",
            "lastShareSeconds",
            "lastShare",
            "lastshare_ago",
        ):
            try:
                v = w.get(k)
                if isinstance(v, (int, float)):
                    return float(v)
                if isinstance(v, str) and v.strip():
                    return float(v.strip())
            except Exception:
                continue
        return None

    active_workers: list[dict] = []
    inactive_workers: list[dict] = []
    pruned_workers = 0
    for w in workers_out:
        if not isinstance(w, dict):
            continue
        hr = worker_hashrate_key(w)
        age = worker_last_share_age_s(w)
        if hr > 0:
            active_workers.append(w)
            continue
        if age is None:
            active_workers.append(w)
            continue
        try:
            age_s = int(float(age))
        except Exception:
            age_s = 0
        if age_s > WORKER_PRUNE_S:
            pruned_workers += 1
            continue
        if age_s > WORKER_ACTIVE_S:
            inactive_workers.append(w)
            continue
        active_workers.append(w)

    active_workers.sort(key=worker_hashrate_key, reverse=True)
    inactive_workers.sort(key=lambda it: float(worker_last_share_age_s(it) or 0.0), reverse=False)
    if limit > 0:
        active_workers = active_workers[:limit]

    res = {
        "ok": True,
        "time": _now_iso(),
        "total": {"hashrate_ths": total_hashrate_ths, "workers": total_workers},
        "pools": pools,
        "workers": active_workers,
        "workers_inactive": inactive_workers,
        "workers_pruned": pruned_workers,
    }
    _FLEET_CACHE["summary"] = {"time": now, "limit": limit, "data": res}
    return res


def read_meminfo_bytes() -> dict[str, int]:
    info: dict[str, int] = {}
    try:
        with open("/proc/meminfo", "r", encoding="utf-8") as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) < 2:
                    continue
                key = parts[0].rstrip(":")
                try:
                    value = int(parts[1])
                except ValueError:
                    continue
                unit = parts[2] if len(parts) >= 3 else ""
                if unit == "kB":
                    value *= 1024
                info[key] = value
    except Exception:
        return {}
    return info


def _detect_primary_net_iface() -> str:
    # Prefer the default route interface (e.g. eth0/enp3s0/wlan0).
    proc = run_cmd(["ip", "-o", "route", "show", "default"], timeout_s=3)
    if proc.returncode == 0:
        m = re.search(r"\bdev\s+([a-zA-Z0-9._:-]+)\b", proc.stdout or "")
        if m:
            return m.group(1).strip()
    return ""


def _read_link_speed_mbps(iface: str) -> int | None:
    # Linux exposes negotiated speed in sysfs for many drivers.
    # -1 / 0 usually means unknown.
    name = (iface or "").strip()
    if not name:
        return None
    try:
        raw = Path("/sys/class/net") / name / "speed"
        if not raw.is_file():
            return None
        val = int(str(raw.read_text(encoding="utf-8") or "").strip())
        if val <= 0:
            return None
        return val
    except Exception:
        return None


def read_netdev_bytes(ifaces: list[str] | None = None) -> tuple[int, int]:
    include = {str(i).strip() for i in (ifaces or []) if str(i).strip()}
    rx_total = 0
    tx_total = 0
    try:
        with open("/proc/net/dev", "r", encoding="utf-8") as f:
            for line in f:
                if ":" not in line:
                    continue
                iface, data = line.split(":", 1)
                name = iface.strip()
                if not name or name == "lo":
                    continue
                if include and name not in include:
                    continue
                # Exclude virtual/docker plumbing by default unless explicitly requested.
                if not include:
                    if name.startswith(("veth", "br-", "docker", "virbr", "tap", "tun", "wg", "zt")):
                        continue
                    if name == "docker0":
                        continue
                parts = data.strip().split()
                if len(parts) < 16:
                    continue
                try:
                    rx_total += int(parts[0])
                    tx_total += int(parts[8])
                except ValueError:
                    continue
    except Exception:
        return 0, 0
    return rx_total, tx_total


def disk_usage(path: str) -> dict | None:
    try:
        st = os.statvfs(path)
    except Exception:
        return None
    total = int(st.f_frsize) * int(st.f_blocks)
    free = int(st.f_frsize) * int(st.f_bavail)
    used = max(0, total - free)
    return {"path": path, "total_bytes": total, "free_bytes": free, "used_bytes": used}


def read_uptime_s() -> float | None:
    try:
        with open("/proc/uptime", "r", encoding="utf-8") as f:
            raw = f.read().strip().split()
        if not raw:
            return None
        return float(raw[0])
    except Exception:
        return None


_CPU_STAT_LOCK = threading.Lock()
_CPU_STAT_CACHE: dict[str, object] = {"time": 0.0, "samples": []}


def _read_proc_stat_cpu_samples() -> list[tuple[int, int]]:
    samples: list[tuple[int, int]] = []
    try:
        with open("/proc/stat", "r", encoding="utf-8") as f:
            for line in f:
                if not line.startswith("cpu"):
                    break
                parts = line.strip().split()
                if not parts:
                    continue
                name = parts[0]
                if name == "cpu":
                    continue
                values: list[int] = []
                for item in parts[1:]:
                    try:
                        values.append(int(item))
                    except ValueError:
                        values.append(0)
                if not values:
                    continue
                total = int(sum(values))
                idle = int(values[3]) if len(values) > 3 else 0
                iowait = int(values[4]) if len(values) > 4 else 0
                samples.append((total, idle + iowait))
    except Exception:
        return []
    return samples


def cpu_utilization_perc() -> tuple[list[float], float | None]:
    now = time.time()
    samples = _read_proc_stat_cpu_samples()
    if not samples:
        return [], None

    with _CPU_STAT_LOCK:
        prev_samples = _CPU_STAT_CACHE.get("samples")
        prev_time = float(_CPU_STAT_CACHE.get("time") or 0.0)
        _CPU_STAT_CACHE["samples"] = samples
        _CPU_STAT_CACHE["time"] = now

    if not isinstance(prev_samples, list) or not prev_time or len(prev_samples) != len(samples):
        return [], None

    per_core: list[float] = []
    for (t0, i0), (t1, i1) in zip(prev_samples, samples):
        dt = int(t1) - int(t0)
        di = int(i1) - int(i0)
        if dt <= 0:
            per_core.append(0.0)
            continue
        busy = max(0, dt - max(0, di))
        per_core.append((busy / dt) * 100.0)

    total = sum(per_core) / len(per_core) if per_core else None
    return per_core, total


def read_cpu_temp_c() -> float | None:
    """
    Best-effort CPU temperature reading (degC) across common Linux sources.

    Returns None when unavailable (e.g. no thermal sensors exposed in a VM).
    """

    def _read_millideg(path: str) -> float | None:
        try:
            raw = Path(path).read_text(encoding="utf-8", errors="ignore").strip()
            if not raw:
                return None
            v = float(raw)
        except Exception:
            return None
        # Most sysfs temps are millidegC.
        if v > 1000:
            return v / 1000.0
        # Some drivers expose degC already.
        return v

    # Prefer thermal zones when present (common on SBCs / some platforms).
    try:
        zones = sorted(Path("/sys/class/thermal").glob("thermal_zone*"))
    except Exception:
        zones = []

    preferred_zone_types = (
        "x86_pkg_temp",
        "cpu-thermal",
        "cpu_thermal",
        "soc",
        "soc-thermal",
    )

    temps: list[float] = []

    for z in zones:
        try:
            ztype = (z / "type").read_text(encoding="utf-8", errors="ignore").strip().lower()
        except Exception:
            ztype = ""
        t = _read_millideg(str(z / "temp"))
        if t is None:
            continue
        # Filter clearly bogus values.
        if t < -10 or t > 130:
            continue
        # Keep preferred sensors earlier; we may return the max anyway.
        if any(k in ztype for k in preferred_zone_types):
            temps.append(t)
        else:
            temps.append(t)

    # Fallback to hwmon inputs (common on x86: coretemp/k10temp).
    try:
        hwmons = sorted(Path("/sys/class/hwmon").glob("hwmon*"))
    except Exception:
        hwmons = []

    for h in hwmons:
        try:
            name = (h / "name").read_text(encoding="utf-8", errors="ignore").strip().lower()
        except Exception:
            name = ""
        if name and name not in {"coretemp", "k10temp"}:
            continue
        for inp in sorted(h.glob("temp*_input")):
            t = _read_millideg(str(inp))
            if t is None:
                continue
            if t < -10 or t > 130:
                continue
            temps.append(t)

    if not temps:
        return None
    # Use the hottest reading as a simple "CPU temp" signal.
    return round(float(max(temps)), 1)


def system_metrics() -> dict:
    try:
        load1, load5, load15 = os.getloadavg()
    except Exception:
        load1, load5, load15 = 0.0, 0.0, 0.0

    per_core, total_perc = cpu_utilization_perc()
    temp_c = read_cpu_temp_c()

    meminfo = read_meminfo_bytes()
    total = int(meminfo.get("MemTotal", 0))
    avail = int(meminfo.get("MemAvailable", 0))
    used = max(0, total - avail) if total and avail else 0

    primary_iface = _detect_primary_net_iface()
    rx_bytes, tx_bytes = read_netdev_bytes([primary_iface] if primary_iface else None)
    link_mbps = _read_link_speed_mbps(primary_iface) if primary_iface else None

    disks: list[dict] = []
    for p in ["/", DATA_DIR]:
        du = disk_usage(p)
        if not du:
            continue
        if any(d.get("path") == du.get("path") for d in disks):
            continue
        disks.append(du)

    return {
        "ok": True,
        "time": _now_iso(),
        "uptime_s": read_uptime_s(),
        "cpu": {
            "cores": os.cpu_count() or 1,
            "load1": float(load1),
            "load5": float(load5),
            "load15": float(load15),
            "total_perc": round(float(total_perc), 3) if total_perc is not None else None,
            "per_core_perc": [round(float(v), 3) for v in per_core],
            "temp_c": temp_c,
        },
        "memory": {
            "total_bytes": total,
            "available_bytes": avail,
            "used_bytes": used,
        },
        "network": {
            "iface": primary_iface or None,
            "link_mbps": link_mbps,
            "rx_bytes": rx_bytes,
            "tx_bytes": tx_bytes,
        },
        "disks": disks,
    }


def system_processes(sort: str | None = None, limit: int | None = None) -> dict:
    s = (sort or "cpu").strip().lower()
    if s not in {"cpu", "mem", "rss"}:
        s = "cpu"
    n = int(limit or 30)
    n = 5 if n < 5 else 200 if n > 200 else n

    sort_flag = "-pcpu" if s == "cpu" else "-pmem" if s == "mem" else "-rss"
    cores = os.cpu_count() or 1
    proc = run_cmd(
        ["ps", "-eo", "pid,user,comm,pcpu,pmem,rss", f"--sort={sort_flag}"],
        timeout_s=3,
    )
    if proc.returncode != 0:
        return {"ok": False, "error": (proc.stderr or "").strip() or "ps failed", "time": _now_iso(), "procs": []}

    out: list[dict] = []
    for line in (proc.stdout or "").splitlines()[1:]:
        raw = line.strip()
        if not raw:
            continue
        parts = raw.split(None, 5)
        if len(parts) < 6:
            continue
        pid_s, user, comm, cpu_s, mem_s, rss_s = parts
        try:
            pid = int(pid_s)
        except Exception:
            continue
        try:
            cpu_raw = float(cpu_s)
        except Exception:
            cpu_raw = None
        try:
            mem = float(mem_s)
        except Exception:
            mem = None
        try:
            rss_kb = int(float(rss_s))
        except Exception:
            rss_kb = None
        cpu = (cpu_raw / cores) if isinstance(cpu_raw, (int, float)) else None
        out.append(
            {
                "pid": pid,
                "user": user,
                "command": comm,
                # Normalize to 0..100 based on core count so UI doesn't show >100%
                # for multi-threaded processes.
                "cpu_perc": cpu,
                "cpu_perc_raw": cpu_raw,
                "mem_perc": mem,
                "rss_bytes": (rss_kb * 1024) if rss_kb is not None else None,
            }
        )
        if len(out) >= n:
            break

    return {"ok": True, "time": _now_iso(), "sort": s, "limit": n, "procs": out}


def _systemctl_show(service: str, prop: str) -> str:
    proc = run_cmd(["systemctl", "show", service, "-p", prop, "--value"], timeout_s=6)
    return (proc.stdout or "").strip()


def _detect_ssh_service() -> str | None:
    for svc in ("ssh", "sshd"):
        state = _systemctl_show(svc, "LoadState")
        if state == "loaded":
            return svc
    return None


_SSH_DROPIN_PATH = "/etc/ssh/sshd_config.d/00-5tratumos.conf"
_SSH_DROPIN_OLD_PATHS = [
    "/etc/ssh/sshd_config.d/00-5tratumos.conf",
    "/etc/ssh/sshd_config.d/5tratumos.conf",
    "/etc/ssh/sshd_config.d/99-5tratumos.conf",
    "/etc/ssh/sshd_config.d/99-5tratumos.conf.bak",
]
_SSH_CLOUDINIT_DROPIN = "/etc/ssh/sshd_config.d/50-cloud-init.conf"
_SSH_CLOUDINIT_DISABLED = "/etc/ssh/sshd_config.d/50-cloud-init.conf.disabled"


def _unix_user_exists(username: str) -> bool:
    user = (username or "").strip()
    if not user:
        return False
    chk = run_cmd(["id", user], timeout_s=6)
    return chk.returncode == 0


def _ssh_admin_user() -> str:
    # Explicit override (advanced deployments).
    env_user = str(_env("SSH_ADMIN_USER", "") or "").strip()
    if env_user:
        return env_user

    # Prefer the default admin account when it exists (legacy installs).
    if _unix_user_exists("admin"):
        return "admin"

    # Next: console user (installer + kiosk deployments).
    try:
        cfg = _read_json(CONSOLE_CONFIG_FILE)
    except Exception:
        cfg = {}
    if isinstance(cfg, dict):
        u = str(cfg.get("user") or "").strip()
        if u and _unix_user_exists(u):
            return u

    # Next: web auth user, if it also exists as a Unix user.
    try:
        auth = _read_json(AUTH_FILE)
    except Exception:
        auth = {}
    if isinstance(auth, dict):
        users = auth.get("users")
        if isinstance(users, list) and users:
            u = str((users[0] or {}).get("username") or "").strip()
            if u and _unix_user_exists(u):
                return u

    # Final fallback.
    return "forge" if _unix_user_exists("forge") else "admin"


def _ensure_unix_user(username: str) -> dict:
    user = (username or "").strip()
    if not user:
        return {"ok": False, "error": "missing username"}
    chk = run_cmd(["id", user], timeout_s=6)
    if chk.returncode == 0:
        return {"ok": True, "user": user, "created": False}

    proc = run_cmd(["useradd", "-m", "-s", "/bin/bash", user], timeout_s=20)
    if proc.returncode != 0:
        return {"ok": False, "error": proc.stderr.strip() or f"useradd exited {proc.returncode}"}

    for grp in ("sudo", "docker", "video", "input", "render"):
        run_cmd(["usermod", "-aG", grp, user], timeout_s=10)

    return {"ok": True, "user": user, "created": True}


def _ssh_prune_old_dropins() -> None:
    for p in _SSH_DROPIN_OLD_PATHS:
        try:
            Path(p).unlink()
        except FileNotFoundError:
            pass


def _ssh_write_dropin(*, enabled: bool) -> None:
    path = Path(_SSH_DROPIN_PATH)
    if not enabled:
        # Restore any cloud-init drop-in we disabled when enabling SSH.
        try:
            disabled = Path(_SSH_CLOUDINIT_DISABLED)
            original = Path(_SSH_CLOUDINIT_DROPIN)
            if disabled.is_file() and not original.exists():
                disabled.rename(original)
        except Exception:
            pass
        _ssh_prune_old_dropins()
        try:
            path.unlink()
        except FileNotFoundError:
            pass
        return
    _ssh_prune_old_dropins()

    # Some images ship a cloud-init drop-in that hard-disables password auth.
    # If present, disable it so our SSH settings are reliable.
    try:
        cloud = Path(_SSH_CLOUDINIT_DROPIN)
        if cloud.is_file():
            raw = cloud.read_text(encoding="utf-8", errors="replace")
            effective = [ln.strip() for ln in raw.splitlines() if ln.strip() and not ln.strip().startswith("#")]
            if effective == ["PasswordAuthentication no"]:
                cloud.rename(Path(_SSH_CLOUDINIT_DISABLED))
    except Exception:
        pass

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        "\n".join(
            [
                "# Managed by 5tratumOS",
                "PasswordAuthentication yes",
                "KbdInteractiveAuthentication yes",
                "PubkeyAuthentication yes",
                "UsePAM yes",
                "",
            ]
        ),
        encoding="utf-8",
    )


def _sshd_effective_settings() -> dict:
    proc = run_cmd(["/usr/sbin/sshd", "-T"], timeout_s=8)
    if proc.returncode != 0:
        return {"ok": False, "error": proc.stderr.strip() or f"sshd exited {proc.returncode}"}
    out = (proc.stdout or "").splitlines()
    kv: dict[str, str] = {}
    for line in out:
        s = str(line or "").strip()
        if not s or " " not in s:
            continue
        k, v = s.split(" ", 1)
        kv[str(k).strip().lower()] = str(v).strip()

    def read_bool(key: str) -> bool | None:
        v = kv.get(key.lower())
        if v is None:
            return None
        if v.lower() in {"yes", "true", "1"}:
            return True
        if v.lower() in {"no", "false", "0"}:
            return False
        return None

    return {
        "ok": True,
        "passwordauthentication": read_bool("passwordauthentication"),
        "kbdinteractiveauthentication": read_bool("kbdinteractiveauthentication"),
        "pubkeyauthentication": read_bool("pubkeyauthentication"),
        "usepam": read_bool("usepam"),
        "permitrootlogin": kv.get("permitrootlogin"),
        "authenticationmethods": kv.get("authenticationmethods"),
    }


def _unix_user_password_state(username: str) -> dict:
    user = (username or "").strip()
    if not user:
        return {"ok": False, "error": "missing username"}
    try:
        import spwd  # type: ignore[attr-defined]
    except Exception:
        return {"ok": False, "error": "shadow database not available"}
    try:
        ent = spwd.getspnam(user)
    except KeyError:
        return {"ok": False, "error": "user not found"}
    pw = str(getattr(ent, "sp_pwdp", "") or "")
    locked = pw.startswith("!") or pw.startswith("*")
    has_password = (not locked) and pw not in {"", "x"}
    return {"ok": True, "user": user, "locked": locked, "has_password": has_password}


def ssh_status() -> dict:
    svc = _detect_ssh_service()
    if not svc:
        return {"ok": True, "installed": False, "enabled": False, "active": False, "service": None}

    enabled_raw = (run_cmd(["systemctl", "is-enabled", svc], timeout_s=6).stdout or "").strip().lower()
    active_raw = (run_cmd(["systemctl", "is-active", svc], timeout_s=6).stdout or "").strip().lower()

    enabled = enabled_raw in {"enabled", "enabled-runtime", "static"}
    active = active_raw == "active"
    eff = _sshd_effective_settings()
    admin_user = _ssh_admin_user()
    admin = _unix_user_password_state(admin_user)
    return {
        "ok": True,
        "installed": True,
        "enabled": enabled,
        "active": active,
        "service": svc,
        "admin_user": admin_user,
        "effective": eff if eff.get("ok") else None,
        "admin": admin if admin.get("ok") else None,
    }


def ssh_set_enabled(enabled: bool) -> dict:
    svc = _detect_ssh_service()
    if not svc:
        return {"ok": False, "error": "ssh service not found", "installed": False}

    try:
        _ssh_write_dropin(enabled=enabled)
    except Exception as e:
        return {"ok": False, "error": f"failed to write ssh config: {e}"}

    if enabled:
        ensure = _ensure_unix_user(_ssh_admin_user())
        if not ensure.get("ok"):
            return {"ok": False, "error": f"failed to ensure admin user '{_ssh_admin_user()}': {ensure.get('error')}"}

    if enabled:
        proc = run_cmd(["systemctl", "enable", "--now", svc], timeout_s=30)
    else:
        proc = run_cmd(["systemctl", "disable", "--now", svc], timeout_s=30)

    if proc.returncode != 0:
        return {
            "ok": False,
            "error": proc.stderr.strip() or f"systemctl exited {proc.returncode}",
            "stdout": proc.stdout,
            "stderr": proc.stderr,
            "service": svc,
        }

    if enabled:
        run_cmd(["systemctl", "reload-or-restart", svc], timeout_s=30)

    st = ssh_status()
    st["changed"] = True
    return st


def ssh_set_admin_password(password: str) -> dict:
    pw = str(password or "")
    if len(pw) < 10:
        return {"ok": False, "error": "password too short (min 10 characters)"}
    user = _ssh_admin_user()
    ensure = _ensure_unix_user(user)
    if not ensure.get("ok"):
        return {"ok": False, "error": f"user not available: {user} ({ensure.get('error')})"}

    run_cmd(["usermod", "-U", user], timeout_s=10)
    proc = run_cmd(["chpasswd"], timeout_s=10, input=f"{user}:{pw}\n")
    if proc.returncode != 0:
        return {"ok": False, "error": proc.stderr.strip() or f"chpasswd exited {proc.returncode}"}
    return {"ok": True, "user": user}


def ssh_add_authorized_key(pubkey: str) -> dict:
    key = str(pubkey or "").strip().replace("\r", "")
    if not key:
        return {"ok": False, "error": "missing public key"}
    if len(key) > 8_000:
        return {"ok": False, "error": "public key too large"}
    if not (key.startswith("ssh-") or key.startswith("ecdsa-")):
        return {"ok": False, "error": "invalid public key format"}

    user = _ssh_admin_user()
    ensure = _ensure_unix_user(user)
    if not ensure.get("ok"):
        return {"ok": False, "error": f"user not available: {user} ({ensure.get('error')})"}
    try:
        import pwd
    except Exception:
        return {"ok": False, "error": "user database not available"}
    try:
        ent = pwd.getpwnam(user)
    except KeyError:
        return {"ok": False, "error": f"user not found: {user}"}

    ssh_dir = Path(ent.pw_dir) / ".ssh"
    auth_file = ssh_dir / "authorized_keys"
    ssh_dir.mkdir(parents=True, exist_ok=True)
    os.chmod(ssh_dir, 0o700)
    try:
        os.chown(ssh_dir, ent.pw_uid, ent.pw_gid)
    except Exception:
        pass

    existing: list[str] = []
    try:
        existing = [ln.strip() for ln in auth_file.read_text(encoding="utf-8").splitlines()]
    except FileNotFoundError:
        existing = []
    except Exception:
        existing = []

    if key in existing:
        return {"ok": True, "added": False, "user": user}

    lines = [ln for ln in existing if ln]
    lines.append(key)
    auth_file.write_text("\n".join(lines) + "\n", encoding="utf-8")
    os.chmod(auth_file, 0o600)
    try:
        os.chown(auth_file, ent.pw_uid, ent.pw_gid)
    except Exception:
        pass
    return {"ok": True, "added": True, "user": user}


def schedule_power_action(action: str) -> dict:
    act = (action or "").strip().lower()
    if act not in {"reboot", "shutdown"}:
        return {"ok": False, "error": "invalid action (expected reboot|shutdown)"}

    cmd = ["systemctl", "reboot"] if act == "reboot" else ["systemctl", "poweroff"]

    def worker() -> None:
        time.sleep(0.6)
        try:
            subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            run_cmd(cmd, timeout_s=10)

    threading.Thread(target=worker, daemon=True).start()
    return {"ok": True, "action": act, "time": _now_iso()}


def docker_compose_project(app_id: str) -> str:
    new_project = f"5tratumos-{app_id}"
    legacy_project = f"{_legacy_brand()}-{app_id}"
    if docker_containers_for_project(new_project):
        return new_project
    if docker_containers_for_project(legacy_project):
        return legacy_project
    return new_project


def docker_containers_for_project(project: str) -> list[dict]:
    proc = run_cmd(
        [
            "docker",
            "ps",
            "-a",
            "--filter",
            f"label=com.docker.compose.project={project}",
            "--format",
            "{{json .}}",
        ],
        timeout_s=30,
    )
    containers: list[dict] = []
    if proc.returncode != 0:
        return containers
    for line in proc.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            containers.append(json.loads(line))
        except Exception:
            continue
    return containers


_SIZE_RE = re.compile(r"^\s*([0-9]*\.?[0-9]+)\s*([A-Za-z]+)\s*$")
_SIZE_UNITS: dict[str, int] = {
    "B": 1,
    "kB": 1000,
    "KB": 1000,
    "MB": 1000**2,
    "GB": 1000**3,
    "TB": 1000**4,
    "PB": 1000**5,
    "KiB": 1024,
    "MiB": 1024**2,
    "GiB": 1024**3,
    "TiB": 1024**4,
    "PiB": 1024**5,
}


def _parse_size_to_bytes(value: str) -> int | None:
    value = value.strip()
    if not value:
        return None
    m = _SIZE_RE.match(value)
    if not m:
        return None
    num_s, unit = m.group(1), m.group(2)
    try:
        num = float(num_s)
    except ValueError:
        return None
    mult = _SIZE_UNITS.get(unit)
    if not mult:
        return None
    return int(num * mult)


def _parse_pair_to_bytes(value: str) -> tuple[int | None, int | None]:
    parts = [p.strip() for p in value.split("/") if p.strip()]
    if len(parts) != 2:
        return None, None
    return _parse_size_to_bytes(parts[0]), _parse_size_to_bytes(parts[1])


def _parse_percent(value: str) -> float | None:
    value = value.strip()
    if not value:
        return None
    if value.endswith("%"):
        value = value[:-1]
    try:
        return float(value)
    except ValueError:
        return None


def docker_stats_for(names: list[str]) -> dict[str, dict]:
    if not names:
        return {}
    proc = run_cmd(
        [
            "docker",
            "stats",
            "--no-stream",
            "--format",
            "{{json .}}",
            *names,
        ],
        timeout_s=15,
    )
    if proc.returncode != 0:
        return {}
    out: dict[str, dict] = {}
    for line in proc.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            data = json.loads(line)
        except Exception:
            continue
        name = str(data.get("Name") or data.get("Container") or "").strip()
        if not name:
            continue
        out[name] = data
    return out


def summarize_resources(containers: list[dict]) -> dict:
    running_names: list[str] = []
    for c in containers:
        name = str(c.get("Names") or "").strip()
        if not name:
            continue
        state = str(c.get("State") or "").strip()
        status = str(c.get("Status") or "").strip()
        if state == "running" or status.startswith("Up "):
            running_names.append(name)

    stats_by_name = docker_stats_for(running_names)
    if not stats_by_name:
        return {"ok": False}
    return summarize_resources_from_stats(containers, stats_by_name)


def summarize_resources_from_stats(containers: list[dict], stats_by_name: dict[str, dict]) -> dict:
    running_names: list[str] = []
    for c in containers:
        name = str(c.get("Names") or "").strip()
        if not name:
            continue
        state = str(c.get("State") or "").strip()
        status = str(c.get("Status") or "").strip()
        if state == "running" or status.startswith("Up "):
            running_names.append(name)

    if not running_names or not stats_by_name:
        return {"ok": False}

    cpu_total = 0.0
    mem_used_total = 0
    mem_limit_max = 0
    net_rx_total = 0
    net_tx_total = 0
    blk_read_total = 0
    blk_write_total = 0

    for name in running_names:
        st = stats_by_name.get(name) or {}

        cpu = _parse_percent(str(st.get("CPUPerc") or ""))
        if cpu is not None:
            cpu_total += cpu

        mem_used, mem_limit = _parse_pair_to_bytes(str(st.get("MemUsage") or ""))
        if mem_used is not None:
            mem_used_total += mem_used
        if mem_limit is not None:
            mem_limit_max = max(mem_limit_max, mem_limit)

        net_rx, net_tx = _parse_pair_to_bytes(str(st.get("NetIO") or ""))
        if net_rx is not None:
            net_rx_total += net_rx
        if net_tx is not None:
            net_tx_total += net_tx

        blk_read, blk_write = _parse_pair_to_bytes(str(st.get("BlockIO") or ""))
        if blk_read is not None:
            blk_read_total += blk_read
        if blk_write is not None:
            blk_write_total += blk_write

    return {
        "ok": True,
        "cpu_perc": round(cpu_total, 3),
        "mem_used_bytes": mem_used_total,
        "mem_limit_bytes": mem_limit_max,
        "net_rx_bytes": net_rx_total,
        "net_tx_bytes": net_tx_total,
        "block_read_bytes": blk_read_total,
        "block_write_bytes": blk_write_total,
    }


def summarize_project_status(project: str) -> dict:
    containers = docker_containers_for_project(project)
    return summarize_project_status_from_containers(containers)


def summarize_project_status_from_containers(containers: list[dict]) -> dict:
    if not containers:
        return {"status": "not-created", "containers": []}
    # Many apps use a short-lived `init` service that exits 0 after generating config.
    # Treat that as normal; otherwise every app would look "degraded" forever.
    scan = [c for c in containers if "-init-" not in str(c.get("Names") or "")]
    if not scan:
        scan = containers
    any_running = False
    any_restarting = False
    any_exited = False
    for c in scan:
        status = str(c.get("Status", ""))
        if status.startswith("Up "):
            any_running = True
        if status.startswith("Restarting"):
            any_restarting = True
        if status.startswith("Exited"):
            any_exited = True
    if any_restarting:
        status = "restarting"
    elif any_running and any_exited:
        status = "degraded"
    elif any_running:
        status = "running"
    elif any_exited:
        status = "stopped"
    else:
        status = "unknown"
    return {"status": status, "containers": containers}


def _reconcile_container_restart_policies_once() -> None:
    # Some older installs created app containers with restart=on-failure, which does not
    # restart cleanly-stopped services after a reboot (exit code 0). Normalize to
    # unless-stopped for non-init services to preserve expected post-reboot behavior.
    installed = list_installed_app_ids()
    for app_id in installed:
        project = docker_compose_project(app_id)
        containers = docker_containers_for_project(project)
        for c in containers:
            name = str(c.get("Names") or "").strip()
            if not name:
                continue
            # Compose service name is embedded in the container name.
            if "-init-" in name:
                continue
            proc = run_cmd(
                ["docker", "inspect", "-f", "{{.HostConfig.RestartPolicy.Name}}", name],
                timeout_s=10,
            )
            policy = (proc.stdout or "").strip().lower()
            if proc.returncode != 0:
                continue
            if not policy or policy.startswith("on-failure"):
                run_cmd(["docker", "update", "--restart", "unless-stopped", name], timeout_s=15)


def _autoheal_degraded_projects_once() -> None:
    # After reboots or partial failures, some projects may be missing a critical service
    # (e.g., pool) while others remain running. Bring them back via a lightweight compose up.
    installed = list_installed_app_ids()
    for app_id in installed:
        project = docker_compose_project(app_id)
        st = summarize_project_status(project)
        if str(st.get("status") or "") != "degraded":
            continue
        stratumos_cmd(["app", "up", app_id], timeout_s=600)


def _boot_reconcile_loop() -> None:
    # Give docker a moment on fresh boots.
    time.sleep(8)
    # Re-apply HTTPS config on boot so OS updates that replace overlay files don't
    # accidentally disable/enabled the portal listener.
    try:
        cfg = _read_https_config()
        enabled = bool(cfg.get("enabled")) if isinstance(cfg, dict) else False
        _apply_https_config(enabled=enabled, regenerate=False)
    except Exception:
        pass
    # Ensure nginx /apps routes reflect currently installed apps and their live ports.
    # This also repairs routes after an OS update that replaces the base nginx config.
    try:
        system_proxy_repair()
    except Exception:
        pass
    while True:
        try:
            _reconcile_container_restart_policies_once()
            _autoheal_degraded_projects_once()
        except Exception:
            pass
        # Re-run periodically to self-heal long-running hosts.
        time.sleep(10 * 60)


def _store_port(store_meta: dict) -> int | None:
    if not isinstance(store_meta, dict):
        return None
    try:
        p = int(str(store_meta.get("port") or "").strip() or "0")
    except Exception:
        p = 0
    return p or None


def _nginx_proxy_block(app_id: str, port: int) -> str:
    aid = str(app_id or "").strip()
    p = int(port)
    if aid.lower() == "axedoom":
        # noVNC's bundled web server doesn't always serve a landing page at "/".
        # Send users directly to the lite client with the correct websocket path.
        return f"""

  location = /apps/{aid} {{
    return 301 /apps/{aid}/;
  }}

  location = /apps/{aid}/ {{
    return 302 /apps/{aid}/vnc_lite.html?scale=1&path=apps/{aid}/websockify;
  }}

  location /apps/{aid}/ {{
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_hide_header X-Frame-Options;
    proxy_hide_header Content-Security-Policy;
    proxy_hide_header Content-Security-Policy-Report-Only;
    proxy_pass http://127.0.0.1:{p}/;
  }}
""".rstrip("\n")
    return f"""

  location = /apps/{aid} {{
    return 301 /apps/{aid}/;
  }}

  location /apps/{aid}/ {{
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_hide_header X-Frame-Options;
    proxy_hide_header Content-Security-Policy;
    proxy_hide_header Content-Security-Policy-Report-Only;
    proxy_set_header Accept-Encoding "";
    sub_filter_once off;
    sub_filter_types text/html text/css application/javascript text/javascript application/json application/manifest+json;
    sub_filter '"/app.css' '"/apps/{aid}/app.css';
    sub_filter "'/app.css" "'/apps/{aid}/app.css";
    sub_filter '"/app.js' '"/apps/{aid}/app.js';
    sub_filter "'/app.js" "'/apps/{aid}/app.js";
    sub_filter '"/assets/' '"/apps/{aid}/assets/';
    sub_filter "'/assets/" "'/apps/{aid}/assets/";
    sub_filter '"/api/' '"/apps/{aid}/api/';
    sub_filter "'/api/" "'/apps/{aid}/api/";
    sub_filter '"/api"' '"/apps/{aid}/api"';
    sub_filter "'/api'" "'/apps/{aid}/api'";
    sub_filter '`/api/' '`/apps/{aid}/api/';
    sub_filter '`/api`' '`/apps/{aid}/api`';
    sub_filter '"/icons/' '"/apps/{aid}/icons/';
    sub_filter "'/icons/" "'/apps/{aid}/icons/";
    sub_filter '"/manifest.webmanifest' '"/apps/{aid}/manifest.webmanifest';
    sub_filter "'/manifest.webmanifest" "'/apps/{aid}/manifest.webmanifest";
    sub_filter '"/sw.js' '"/apps/{aid}/sw.js';
    sub_filter "'/sw.js" "'/apps/{aid}/sw.js";
    proxy_pass http://127.0.0.1:{p}/;
  }}
""".rstrip("\n")


def system_proxy_repair() -> dict:
    overlay_dir = Path(ROOT_DIR) / "overlay"
    conf_path = overlay_dir / "nginx" / "default.conf"
    if not conf_path.is_file():
        return {"ok": False, "error": f"nginx config not found: {conf_path}"}

    def docker_project_published_ports(app_id: str) -> list[int]:
        project = docker_compose_project(app_id)
        ports: set[int] = set()
        for c in docker_containers_for_project(project):
            raw = str(c.get("Ports") or "")
            # Example: "0.0.0.0:21214->3000/tcp, [::]:21214->3000/tcp"
            for m in re.finditer(r":(\d+)->\d+/(?:tcp|udp)", raw):
                try:
                    ports.add(int(m.group(1)))
                except Exception:
                    continue
        return sorted(ports)

    def port_speaks_http(port: int) -> bool:
        p = int(port)
        if p <= 0 or p > 65535:
            return False
        url = f"http://127.0.0.1:{p}/"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "5tratumosd"}, method="GET")
            with urllib.request.urlopen(req, timeout=1.2) as resp:  # noqa: S310
                _ = resp.status
            return True
        except urllib.error.HTTPError:
            # Any HTTP response implies the upstream is reachable and speaking HTTP.
            return True
        except Exception:
            return False

    def detect_ui_port(app_id: str, store_port: int | None) -> int | None:
        candidates: list[int] = []
        if store_port:
            candidates.append(int(store_port))
        # Prefer actual published host ports when they exist.
        candidates.extend(docker_project_published_ports(app_id))

        seen: set[int] = set()
        uniq: list[int] = []
        for p in candidates:
            try:
                pp = int(p)
            except Exception:
                continue
            if pp <= 0 or pp > 65535:
                continue
            if pp in seen:
                continue
            seen.add(pp)
            uniq.append(pp)

        for p in uniq:
            if port_speaks_http(p):
                return p
        # Fall back to the store/default port when probing fails.
        if store_port:
            return int(store_port)
        return uniq[0] if uniq else None

    installed: list[dict] = []
    for app_id in list_installed_app_ids():
        install_meta = read_app_install_meta(app_id)
        meta_ch = str(install_meta.get("channel") or "").strip().lower()
        preferred_channels: list[str] = []
        sys_ch = str(read_default_channel() or "").strip().lower()
        allowed = allowed_store_channels()
        if sys_ch in allowed:
            preferred_channels.append(sys_ch)
        if meta_ch in allowed and meta_ch not in preferred_channels:
            preferred_channels.append(meta_ch)
        for ch in allowed:
            if ch not in preferred_channels:
                preferred_channels.append(ch)

        store_meta: dict = {}
        for ch in preferred_channels:
            m = store_app_by_id_in_channel(app_id, ch)
            if m:
                store_meta = m
                break

        store_port = _store_port(store_meta)

        port = detect_ui_port(app_id, store_port)
        if not port:
            continue
        installed.append({"id": app_id, "port": int(port), "store_port": int(store_port) if store_port else None})

    try:
        original = conf_path.read_text(encoding="utf-8")
    except Exception as e:
        return {"ok": False, "error": f"failed to read nginx config: {e}"}

    updated: list[dict] = []
    added: list[dict] = []
    next_conf = original

    def insert_before_final_brace(text: str, block: str) -> str:
        m = re.search(r"\n}\s*\Z", text)
        if not m:
            return text.rstrip() + "\n" + block.strip() + "\n"
        return text[: m.start()] + "\n" + block.strip() + text[m.start() :]

    for entry in installed:
        app_id = str(entry.get("id") or "").strip()
        port = int(entry.get("port") or 0)
        if not app_id or port <= 0:
            continue
        pat = re.compile(
            rf"(location\s+/apps/{re.escape(app_id)}/\s*\{{.*?\bproxy_pass\s+http://127\.0\.0\.1:)(\d+)(/;)",
            re.S,
        )

        def _repl(m: re.Match) -> str:
            old = m.group(2)
            if old != str(port):
                updated.append({"id": app_id, "from": int(old), "to": port})
            return f"{m.group(1)}{port}{m.group(3)}"

        next2, n = pat.subn(_repl, next_conf, count=1)
        if n == 0:
            block = _nginx_proxy_block(app_id, port)
            next_conf = insert_before_final_brace(next_conf, block)
            added.append({"id": app_id, "port": port})
        else:
            next_conf = next2

    changed = next_conf != original
    backup_path = conf_path.with_suffix(".conf.bak")
    if changed:
        try:
            if not backup_path.exists():
                backup_path.write_text(original, encoding="utf-8")
        except Exception:
            pass
        try:
            tmp = conf_path.with_suffix(".conf.tmp")
            tmp.write_text(next_conf, encoding="utf-8")
            tmp.replace(conf_path)
        except Exception as e:
            return {"ok": False, "error": f"failed to write nginx config: {e}"}

    proc = run_cmd(
        ["docker", "compose", "--project-name", "5tratumos-overlay", "restart", "portal"],
        cwd=str(overlay_dir),
        timeout_s=180,
    )
    ok = proc.returncode == 0
    return {
        "ok": ok,
        "changed": bool(changed),
        "updated": updated,
        "added": added,
        "restart": {"ok": ok, "code": proc.returncode, "stdout": proc.stdout, "stderr": proc.stderr},
    }


def list_available_app_ids(channel: str | None = None) -> dict:
    args = ["5tratumos", "app", "available"]
    env = os.environ.copy()
    if channel:
        env["FIVETRATUMOS_CHANNEL"] = channel
    proc = subprocess.run(args, env=env, capture_output=True, text=True, check=False)
    if proc.returncode != 0:
        return {
            "ok": False,
            "error": proc.stderr.strip() or f"5tratumos exited {proc.returncode}",
            "channel": channel,
            "apps": [],
        }
    apps = [ln.strip() for ln in proc.stdout.splitlines() if ln.strip()]
    return {"ok": True, "channel": channel, "apps": apps}


def stratumos_cmd(args: list[str], *, timeout_s: int = 1800) -> dict:
    proc = run_cmd(["5tratumos", *args], timeout_s=timeout_s)
    return {
        "ok": proc.returncode == 0,
        "code": proc.returncode,
        "stdout": proc.stdout,
        "stderr": proc.stderr,
    }


def terminal_run(command: str) -> dict:
    raw_all = str(command or "").strip()
    if not raw_all:
        return {"ok": False, "error": "missing command"}
    if len(raw_all) > 2000:
        return {"ok": False, "error": "command too long"}

    lines = [ln.strip() for ln in raw_all.splitlines() if ln.strip()]
    if not lines:
        return {"ok": False, "error": "missing command"}
    if len(lines) > 40:
        return {"ok": False, "error": "too many lines (max 40)"}

    stdout_parts: list[str] = []
    stderr_parts: list[str] = []
    last_code = 0

    def run_one(raw: str) -> dict:
        try:
            parts = shlex.split(raw)
        except ValueError:
            parts = raw.split()

        if not parts:
            return {"ok": False, "error": "missing command", "code": 2}

        if parts[0] == "5tratumos":
            parts = parts[1:]
        if parts and parts[0] in {"channel", "store", "overlay", "app", "help"}:
            if parts[:2] == ["overlay", "logs"]:
                return {
                    "ok": False,
                    "error": "overlay logs is not supported in the web terminal (use app logs or the Logs tab).",
                    "code": 2,
                }

            if parts[:2] == ["app", "logs"] and len(parts) >= 3:
                app_id = str(parts[2] or "").strip()
                if not app_id:
                    return {"ok": False, "error": "missing app id", "code": 2}
                app_dir = os.path.join(APPS_DIR, app_id)
                if not os.path.isdir(app_dir):
                    return {"ok": False, "error": f"app not installed: {app_id}", "code": 2}
                project = docker_compose_project(app_id)
                proc = run_cmd(
                    ["docker", "compose", "--project-name", project, "logs", "--no-color", "--tail=200"],
                    cwd=app_dir,
                    timeout_s=30,
                )
                return {
                    "ok": proc.returncode == 0,
                    "code": proc.returncode,
                    "stdout": proc.stdout,
                    "stderr": proc.stderr,
                }

            timeout = 120
            if parts[:2] in (["store", "sync"], ["app", "install"], ["app", "update"], ["app", "pull"]):
                timeout = 1800
            if parts[:2] in (["app", "up"],):
                timeout = 900

            return stratumos_cmd(parts, timeout_s=timeout)

        cmd = parts[0]
        safe_cmds = {
            "ls",
            "pwd",
            "whoami",
            "id",
            "uname",
            "uptime",
            "df",
            "free",
            "ip",
            "ps",
            "ss",
            "cat",
            "tail",
            "journalctl",
            "systemctl",
        }
        if cmd not in safe_cmds:
            return {"ok": False, "error": f"command not allowed: {cmd}", "code": 2}

        if cmd == "ip":
            banned = {"add", "del", "delete", "set", "flush", "replace", "change", "chg"}
            if any(str(p).strip().lower() in banned for p in parts[1:]):
                return {
                    "ok": False,
                    "error": "ip modification commands are disabled in the web terminal (try: ip a)",
                    "code": 2,
                }

        if cmd == "systemctl":
            sub = str(parts[1] if len(parts) >= 2 else "").strip().lower()
            allowed = {"status", "is-active", "is-enabled", "list-units", "list-unit-files"}
            if sub not in allowed:
                return {
                    "ok": False,
                    "error": "systemctl is restricted in the web terminal (try: systemctl status <service>)",
                    "code": 2,
                }

        if cmd == "journalctl":
            banned = {"--update-catalog", "--flush", "--sync"}
            if any(str(p).strip().lower() in banned for p in parts[1:]):
                return {"ok": False, "error": "journalctl action is disabled in the web terminal", "code": 2}

        proc = run_cmd(parts, timeout_s=30)
        return {
            "ok": proc.returncode == 0,
            "code": proc.returncode,
            "stdout": proc.stdout,
            "stderr": proc.stderr,
        }

    for ln in lines:
        res = run_one(ln)
        ok = bool(res.get("ok"))
        last_code = int(res.get("code") or 0) if isinstance(res.get("code"), int) else last_code
        if ok:
            stdout_parts.append(str(res.get("stdout") or "").rstrip())
            if res.get("stderr"):
                stderr_parts.append(str(res.get("stderr") or "").rstrip())
            continue

        err = str(res.get("error") or "").strip() or "error"
        stderr_parts.append(err)
        return {
            "ok": False,
            "code": int(res.get("code") or 2),
            "stdout": "\n".join([p for p in stdout_parts if p != ""]),
            "stderr": "\n".join([p for p in stderr_parts if p != ""]),
        }

    return {
        "ok": True,
        "code": last_code,
        "stdout": "\n".join([p for p in stdout_parts if p != ""]),
        "stderr": "\n".join([p for p in stderr_parts if p != ""]),
    }


class Handler(BaseHTTPRequestHandler):
    server_version = "5tratumosd/0.1"

    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write("%s - - [%s] %s\n" % (self.address_string(), _now_iso(), fmt % args))

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)

        if path.startswith("/api/v0/auth/"):
            if path == "/api/v0/auth/status":
                json_response(self, HTTPStatus.OK, auth_status(self))
                return
            if path == "/api/v0/auth/check":
                user = current_user(self)
                if user:
                    json_response(self, HTTPStatus.OK, {"ok": True, "user": user})
                else:
                    json_response(self, HTTPStatus.UNAUTHORIZED, {"ok": False, "error": "unauthorized"})
                return
            if path == "/api/v0/auth/keyboard":
                json_response(self, HTTPStatus.OK, keyboard_layout_get(self))
                return

            json_response(self, HTTPStatus.NOT_FOUND, {"ok": False, "error": "not found"})
            return

        if path == "/api/v0/health":
            json_response(
                self,
                HTTPStatus.OK,
                {"ok": True, "service": "5tratumosd", "version": "0.1", "time": _now_iso()},
            )
            return

        if path.startswith("/api/v0/") and not current_user(self):
            json_response(self, HTTPStatus.UNAUTHORIZED, {"ok": False, "error": "unauthorized"})
            return

        if path == "/api/v0/system/metrics":
            json_response(self, HTTPStatus.OK, system_metrics())
            return

        if path == "/api/v0/system/processes":
            sort = (qs.get("sort") or ["cpu"])[0]
            limit_raw = (qs.get("limit") or ["30"])[0]
            try:
                limit = int(str(limit_raw).strip() or "30")
            except Exception:
                limit = 30
            json_response(self, HTTPStatus.OK, system_processes(sort, limit))
            return

        if path == "/api/v0/system/ssh":
            json_response(self, HTTPStatus.OK, ssh_status())
            return

        if path == "/api/v0/system/console":
            json_response(self, HTTPStatus.OK, console_status())
            return

        if path == "/api/v0/system/session":
            json_response(self, HTTPStatus.OK, system_session_config_get())
            return

        if path == "/api/v0/system/ui":
            json_response(self, HTTPStatus.OK, system_ui_config_get())
            return

        if path == "/api/v0/system/https":
            json_response(self, HTTPStatus.OK, https_config_get())
            return

        if path == "/api/v0/system/storage":
            json_response(self, HTTPStatus.OK, system_storage_status())
            return

        if path == "/api/v0/system/wifi/status":
            json_response(self, HTTPStatus.OK, system_wifi_status())
            return

        if path == "/api/v0/system/wifi/scan":
            json_response(self, HTTPStatus.OK, system_wifi_scan())
            return
        if path == "/api/v0/system/storage/orphans":
            scan_sizes = False
            if "sizes" in qs and qs["sizes"]:
                scan_sizes = str(qs["sizes"][0] or "").strip().lower() in {"1", "true", "yes", "y"}
            json_response(self, HTTPStatus.OK, system_storage_orphans(scan_sizes=scan_sizes))
            return

        if path == "/api/v0/desktop/state":
            json_response(self, HTTPStatus.OK, desktop_state_get())
            return

        if path == "/api/v0/apps/pages":
            json_response(self, HTTPStatus.OK, apps_pages_get())
            return

        if path == "/api/v0/system/mqtt/config":
            json_response(self, HTTPStatus.OK, mqtt_config_get())
            return

        if path == "/api/v0/system/discord/config":
            json_response(self, HTTPStatus.OK, discord_config_get())
            return

        if path == "/api/v0/system/watchdog/config":
            json_response(self, HTTPStatus.OK, watchdog_config_get())
            return

        if path == "/api/v0/system/proxy":
            json_response(self, HTTPStatus.OK, {"ok": True, "repair": "/api/v0/system/proxy/repair"})
            return

        if path == "/api/v0/apps/migrate/status":
            app_id = (qs.get("id") or [""])[0].strip().lower()
            if not app_id:
                json_response(self, HTTPStatus.BAD_REQUEST, {"ok": False, "error": "missing id"})
                return
            json_response(self, HTTPStatus.OK, migrate_status_read(app_id))
            return

        if path == "/api/v0/system/update/check":
            channel = None
            if "channel" in qs and qs["channel"]:
                channel = qs["channel"][0]
            force = False
            if "force" in qs and qs["force"]:
                force = str(qs["force"][0] or "").strip().lower() in {"1", "true", "yes", "y"}
            json_response(self, HTTPStatus.OK, system_update_check_cached(channel, force=force))
            return

        if path == "/api/v0/system/update/config":
            json_response(self, HTTPStatus.OK, system_update_config_get())
            return

        if path == "/api/v0/system/update/status":
            json_response(self, HTTPStatus.OK, update_status_read())
            return

        if path == "/api/v0/system/channel":
            json_response(self, HTTPStatus.OK, system_channel_get())
            return

        if path == "/api/v0/system/osupdate/check":
            json_response(self, HTTPStatus.OK, os_update_check())
            return

        if path == "/api/v0/store/config":
            json_response(self, HTTPStatus.OK, store_config_get())
            return

        if path == "/api/v0/apps/installed":
            apps = []
            app_ids = list_installed_app_ids()
            containers_by_app: dict[str, list[dict]] = {}
            running_names: list[str] = []

            for app_id in app_ids:
                project = docker_compose_project(app_id)
                containers = docker_containers_for_project(project)
                containers_by_app[app_id] = containers
                for c in containers:
                    name = str(c.get("Names") or "").strip()
                    if not name:
                        continue
                    state = str(c.get("State") or "").strip()
                    status = str(c.get("Status") or "").strip()
                    if state == "running" or status.startswith("Up "):
                        running_names.append(name)

            stats_by_name = docker_stats_for(sorted(set(running_names)))

            for app_id in app_ids:
                install_meta = read_app_install_meta(app_id)
                meta_ch = str(install_meta.get("channel") or "").strip().lower()
                preferred_channels: list[str] = []
                sys_ch = str(read_default_channel() or "").strip().lower()
                allowed = allowed_store_channels()
                if sys_ch in allowed:
                    preferred_channels.append(sys_ch)
                if meta_ch in allowed and meta_ch not in preferred_channels:
                    preferred_channels.append(meta_ch)
                for ch in allowed:
                    if ch not in preferred_channels:
                        preferred_channels.append(ch)

                store_meta: dict = {}
                for ch in preferred_channels:
                    m = store_app_by_id_in_channel(app_id, ch)
                    if m:
                        store_meta = m
                        break
                containers = containers_by_app.get(app_id, [])
                st = summarize_project_status_from_containers(containers)
                resources = summarize_resources_from_stats(containers, stats_by_name)
                port = _store_port(store_meta)

                installed_version = str(install_meta.get("installed_version") or "").strip()
                if not installed_version:
                    inferred = infer_installed_version(project, st.get("containers") or [])
                    if inferred:
                        installed_version = inferred
                latest_version = str(store_meta.get("version") or "").strip()
                if not installed_version and latest_version:
                    installed_version = latest_version
                update_available = is_update_available(installed_version, latest_version)

                data_dir = _app_state_dir(app_id)
                data_target, data_is_link = _app_state_target(app_id)
                storage_missing = data_is_link and not os.path.exists(data_target)
                if storage_missing:
                    st["status"] = "offline"
                    st["containers"] = []
                    resources = {"ok": False}
                apps.append(
                    {
                        "id": app_id,
                        "name": str(store_meta.get("name") or app_id),
                        "store": store_meta if store_meta else None,
                        "rollbacks": install_meta.get("rollbacks") if isinstance(install_meta.get("rollbacks"), list) else [],
                        "status": st["status"],
                        "installed_version": installed_version,
                        "latest_version": latest_version,
                        "update_available": bool(update_available),
                        "update": {
                            "available": bool(update_available),
                            "installed_version": installed_version,
                            "latest_version": latest_version,
                        },
                        "containers": st["containers"],
                        "resources": resources if resources.get("ok") else None,
                        "storage": {
                            "data_dir": data_dir,
                            "target": data_target,
                            "is_link": bool(data_is_link),
                            "missing": bool(storage_missing),
                        },
                        "ui": {
                            "path": f"/apps/{app_id}/",
                            "port": port,
                        },
                    }
                )
            json_response(self, HTTPStatus.OK, {"ok": True, "apps": apps})
            return

        if path == "/api/v0/apps/widgets":
            def _compute_widgets() -> dict:
                return list_app_widgets()

            json_response(
                self,
                HTTPStatus.OK,
                _api_cache_get_or_refresh(
                    cache_key="apps_widgets",
                    compute=_compute_widgets,
                    max_age_s=30,
                ),
            )
            return

        if path == "/api/v0/fleet/summary":
            limit = None
            if "limit" in qs and qs["limit"]:
                try:
                    limit = int(str(qs["limit"][0]).strip() or "0")
                except Exception:
                    limit = None
            limit_key = str(limit) if isinstance(limit, int) and limit > 0 else "all"

            def _compute_fleet() -> dict:
                return axe_fleet_summary(limit_workers=limit)

            json_response(
                self,
                HTTPStatus.OK,
                _api_cache_get_or_refresh(
                    cache_key=f"fleet_summary_{limit_key}",
                    compute=_compute_fleet,
                    max_age_s=30,
                ),
            )
            return

        if path == "/api/v0/apps/available":
            channel = None
            if "channel" in qs and qs["channel"]:
                channel = qs["channel"][0]
            json_response(self, HTTPStatus.OK, list_available_app_ids(channel))
            return

        if path == "/api/v0/store/config":
            json_response(self, HTTPStatus.OK, store_config_get())
            return

        if path == "/api/v0/store/apps":
            channel = None
            if "channel" in qs and qs["channel"]:
                channel = qs["channel"][0]
            json_response(self, HTTPStatus.OK, list_store_apps(channel))
            return

        if path == "/api/v0/apps/logs":
            app_id = (qs.get("id") or [""])[0].strip()
            if not app_id:
                json_response(self, HTTPStatus.BAD_REQUEST, {"ok": False, "error": "missing id"})
                return
            tail_raw = (qs.get("tail") or ["200"])[0]
            try:
                tail = max(1, min(2000, int(tail_raw)))
            except ValueError:
                tail = 200
            app_dir = os.path.join(APPS_DIR, app_id)
            if not os.path.isdir(app_dir):
                json_response(self, HTTPStatus.NOT_FOUND, {"ok": False, "error": "app not installed"})
                return

            project = docker_compose_project(app_id)
            proc = run_cmd(
                ["docker", "compose", "--project-name", project, "logs", "--no-color", f"--tail={tail}"],
                cwd=app_dir,
                timeout_s=30,
            )
            json_response(
                self,
                HTTPStatus.OK,
                {
                    "ok": proc.returncode == 0,
                    "code": proc.returncode,
                    "stdout": proc.stdout,
                    "stderr": proc.stderr,
                },
            )
            return

        json_response(self, HTTPStatus.NOT_FOUND, {"ok": False, "error": "not found"})

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        body = read_body_json(self)

        if path == "/api/v0/auth/login":
            status, payload, headers = handle_login(self, body if isinstance(body, dict) else {})
            json_response(self, int(status), payload, headers=headers)
            return

        if path == "/api/v0/auth/setup":
            status, payload, headers = handle_setup(self, body if isinstance(body, dict) else {})
            json_response(self, int(status), payload, headers=headers)
            return

        if path == "/api/v0/auth/logout":
            status, payload, headers = handle_logout(self)
            json_response(self, int(status), payload, headers=headers)
            return

        if path == "/api/v0/auth/credentials":
            if not current_user(self):
                json_response(self, HTTPStatus.UNAUTHORIZED, {"ok": False, "error": "unauthorized"})
                return
            status, payload, headers = handle_update_credentials(self, body if isinstance(body, dict) else {})
            json_response(self, int(status), payload, headers=headers)
            return

        if path == "/api/v0/auth/keyboard":
            if not isinstance(body, dict):
                json_response(self, HTTPStatus.BAD_REQUEST, {"ok": False, "error": "invalid body"})
                return
            res = keyboard_layout_set(self, body)
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path.startswith("/api/v0/") and not current_user(self):
            json_response(self, HTTPStatus.UNAUTHORIZED, {"ok": False, "error": "unauthorized"})
            return

        if path == "/api/v0/system/update/config":
            res = system_update_config_set(body if isinstance(body, dict) else {})
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/system/channel":
            res = system_channel_set(body if isinstance(body, dict) else {})
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/system/osupdate/apply":
            res = os_update_apply()
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/store/config":
            res = store_config_set(body if isinstance(body, dict) else {})
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/terminal/run":
            cmd = str(body.get("cmd") or "") if isinstance(body, dict) else ""
            res = terminal_run(cmd)
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/system/power":
            action = str(body.get("action") or "").strip().lower() if isinstance(body, dict) else ""
            res = schedule_power_action(action)
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/system/ssh":
            enabled = bool(body.get("enabled")) if isinstance(body, dict) else False
            res = ssh_set_enabled(enabled)
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/system/console":
            if not isinstance(body, dict):
                json_response(self, HTTPStatus.BAD_REQUEST, {"ok": False, "error": "invalid body"})
                return
            patch_enabled = body.get("enabled", None)
            patch_prompted = body.get("prompted", None)

            if patch_enabled is not None:
                res = set_console_enabled(enabled=bool(patch_enabled))
                if patch_prompted is not None:
                    cfg = read_console_config()
                    cfg["prompted"] = bool(patch_prompted)
                    write_console_config(cfg)
                    res = console_status()
                json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
                return

            if patch_prompted is not None:
                cfg = read_console_config()
                cfg["prompted"] = bool(patch_prompted)
                write_console_config(cfg)
                res = console_status()
                json_response(self, HTTPStatus.OK, res)
                return

            json_response(self, HTTPStatus.OK, console_status())
            return

        if path == "/api/v0/system/session":
            res = system_session_config_set(body if isinstance(body, dict) else {})
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/system/ui":
            res = system_ui_config_set(body if isinstance(body, dict) else {})
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/system/storage/config":
            res = storage_config_set(body if isinstance(body, dict) else {})
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/system/wifi/toggle":
            res = system_wifi_toggle(body if isinstance(body, dict) else {})
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/system/wifi/connect":
            res = system_wifi_connect(body if isinstance(body, dict) else {})
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/system/wifi/disconnect":
            res = system_wifi_disconnect()
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/desktop/state":
            res = desktop_state_set(body if isinstance(body, dict) else {})
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/apps/pages":
            res = apps_pages_set(body if isinstance(body, dict) else {})
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/system/mqtt/config":
            res = mqtt_config_set(body if isinstance(body, dict) else {})
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/system/discord/config":
            res = discord_config_set(body if isinstance(body, dict) else {})
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/system/watchdog/config":
            res = watchdog_config_set(body if isinstance(body, dict) else {})
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/system/https":
            res = https_config_set(body if isinstance(body, dict) else {})
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/system/proxy/repair":
            res = system_proxy_repair()
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/system/ssh/password":
            password = str(body.get("password") or "") if isinstance(body, dict) else ""
            res = ssh_set_admin_password(password)
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/system/ssh/authorized-key":
            key = str(body.get("key") or body.get("public_key") or "") if isinstance(body, dict) else ""
            res = ssh_add_authorized_key(key)
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/system/update/apply":
            channel = str(body.get("channel") or "").strip().lower() if isinstance(body, dict) else ""
            res = system_update_apply(channel or None)
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/store/sync":
            channel = str(body.get("channel") or "").strip().lower() if isinstance(body, dict) else ""
            args = ["store", "sync"]
            if channel:
                args.append(channel)
            res = stratumos_cmd(args, timeout_s=1800)
            if res.get("ok"):
                if channel in {"main", "dev", "global"}:
                    _STORE_CACHE.pop(channel, None)
                else:
                    _STORE_CACHE.clear()
            json_response(self, HTTPStatus.OK if res["ok"] else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/apps/repair":
            app_id = str(body.get("id") or body.get("app_id") or "").strip().lower() if isinstance(body, dict) else ""
            if not app_id:
                json_response(self, HTTPStatus.BAD_REQUEST, {"ok": False, "error": "missing app id"})
                return
            req_ch = str(body.get("channel") or "").strip().lower() if isinstance(body, dict) else ""
            ch = _store_channel_for_app_action(app_id, req_ch or None)
            args = ["app", "repair", app_id]
            if ch:
                args += ["--channel", ch]
            res = stratumos_cmd(args, timeout_s=1800)
            if res.get("ok"):
                proxy_res = system_proxy_repair()
                res["proxy"] = proxy_res
                if ch:
                    _update_app_install_meta_channel(app_id, ch)
                    _installed_registry_update_meta(app_id, {"channel": ch})
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/apps/migrate":
            app_id = str(body.get("id") or body.get("app_id") or "").strip().lower() if isinstance(body, dict) else ""
            mountpoint = str(body.get("mountpoint") or body.get("mount") or "").strip() if isinstance(body, dict) else ""
            keep_backup = bool(body.get("keep_backup")) if isinstance(body, dict) else False
            res = app_migrate_data(app_id, mountpoint, keep_backup=keep_backup)
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        if path == "/api/v0/system/storage/orphans/delete":
            res = system_storage_orphans_delete(body if isinstance(body, dict) else {})
            json_response(self, HTTPStatus.OK if res.get("ok") else HTTPStatus.BAD_REQUEST, res)
            return

        m = re.fullmatch(r"/api/v0/apps/([a-z0-9][a-z0-9_-]*)/(install|uninstall|update|rollback|up|down|pull|redeploy)", path)
        if m:
            app_id, action = m.group(1), m.group(2)

            if action == "install":
                channel = body.get("channel")
                if channel:
                    res = stratumos_cmd(["app", "install", app_id, "--channel", str(channel)], timeout_s=600)
                else:
                    res = stratumos_cmd(["app", "install", app_id], timeout_s=600)
                if (not res.get("ok")) and _looks_like_already_installed(res):
                    wait = _wait_for_app_removed(app_id, timeout_s=90)
                    res["removal_wait"] = wait
                    if wait.get("ok"):
                        if channel:
                            res = stratumos_cmd(["app", "install", app_id, "--channel", str(channel)], timeout_s=600)
                        else:
                            res = stratumos_cmd(["app", "install", app_id], timeout_s=600)
                if res.get("ok"):
                    _installed_registry_set(app_id, True)
                    if channel:
                        ch = str(channel).strip().lower()
                        _update_app_install_meta_channel(app_id, ch)
                        _installed_registry_update_meta(app_id, {"channel": ch})
                    proxy_res = system_proxy_repair()
                    res["proxy"] = proxy_res
                json_response(self, HTTPStatus.OK if res["ok"] else HTTPStatus.BAD_REQUEST, res)
                return

            if action == "uninstall":
                purge = bool(body.get("purge")) if isinstance(body, dict) else False
                args = ["app", "uninstall", app_id]
                if purge:
                    args.append("--purge")
                res = stratumos_cmd(args, timeout_s=600)
                if res.get("ok"):
                    _installed_registry_set(app_id, False)
                    wait = _wait_for_app_removed(app_id, timeout_s=90)
                    res["removal_wait"] = wait
                    proxy_res = system_proxy_repair()
                    res["proxy"] = proxy_res
                json_response(self, HTTPStatus.OK if res["ok"] else HTTPStatus.BAD_REQUEST, res)
                return

            if action == "update":
                channel = str(body.get("channel") or "") if isinstance(body, dict) else ""
                channel = channel.strip().lower()
                args = ["app", "update", app_id]
                if channel and (channel in allowed_store_channels() or channel.startswith("custom")):
                    args += ["--channel", channel]
                res = stratumos_cmd(args, timeout_s=1800)
                if res.get("ok") and channel:
                    _update_app_install_meta_channel(app_id, channel)
                    _installed_registry_update_meta(app_id, {"channel": channel})
                if res.get("ok"):
                    proxy_res = system_proxy_repair()
                    res["proxy"] = proxy_res
                json_response(self, HTTPStatus.OK if res["ok"] else HTTPStatus.BAD_REQUEST, res)
                return

            if action == "rollback":
                version = str(body.get("version") or body.get("to") or "") if isinstance(body, dict) else ""
                version = version.strip()
                args = ["app", "rollback", app_id]
                if version:
                    args += ["--to", version]
                res = stratumos_cmd(args, timeout_s=1800)
                if res.get("ok"):
                    proxy_res = system_proxy_repair()
                    res["proxy"] = proxy_res
                json_response(self, HTTPStatus.OK if res["ok"] else HTTPStatus.BAD_REQUEST, res)
                return

            if action == "up":
                res = stratumos_cmd(["app", "up", app_id], timeout_s=1800)
                if res.get("ok"):
                    proxy_res = system_proxy_repair()
                    res["proxy"] = proxy_res
                json_response(self, HTTPStatus.OK if res["ok"] else HTTPStatus.BAD_REQUEST, res)
                return

            if action == "down":
                res = stratumos_cmd(["app", "down", app_id], timeout_s=600)
                if res.get("ok"):
                    watchdog_note_manual_stop(app_id)
                    proxy_res = system_proxy_repair()
                    res["proxy"] = proxy_res
                json_response(self, HTTPStatus.OK if res["ok"] else HTTPStatus.BAD_REQUEST, res)
                return

            if action == "pull":
                res = stratumos_cmd(["app", "pull", app_id], timeout_s=1800)
                if res.get("ok"):
                    proxy_res = system_proxy_repair()
                    res["proxy"] = proxy_res
                json_response(self, HTTPStatus.OK if res["ok"] else HTTPStatus.BAD_REQUEST, res)
                return

            if action == "redeploy":
                payload = body if isinstance(body, dict) else {}
                pull = payload.get("pull")
                pull = True if pull is None else bool(pull)

                steps = []
                ok = True

                if pull:
                    pull_res = stratumos_cmd(["app", "pull", app_id], timeout_s=1800)
                    steps.append({"step": "pull", **pull_res})
                    ok = ok and bool(pull_res.get("ok"))

                down_res = stratumos_cmd(["app", "down", app_id], timeout_s=600)
                steps.append({"step": "down", **down_res})
                ok = ok and bool(down_res.get("ok"))

                up_res = stratumos_cmd(["app", "up", app_id], timeout_s=1800)
                steps.append({"step": "up", **up_res})
                ok = ok and bool(up_res.get("ok"))

                proxy = None
                if ok:
                    proxy = system_proxy_repair()
                json_response(
                    self,
                    HTTPStatus.OK if ok else HTTPStatus.BAD_REQUEST,
                    {"ok": ok, "app": app_id, "steps": steps, "proxy": proxy},
                )
                return

        json_response(self, HTTPStatus.NOT_FOUND, {"ok": False, "error": "not found"})


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=9000)
    args = parser.parse_args()

    _installed_registry_bootstrap()

    server = ThreadingHTTPServer((args.host, args.port), Handler)
    sys.stderr.write(f"5tratumosd listening on http://{args.host}:{args.port}\n")
    threading.Thread(target=_notify_loop, daemon=True).start()
    threading.Thread(target=_system_update_check_loop, daemon=True).start()
    threading.Thread(target=_support_checkin_loop, daemon=True).start()
    threading.Thread(target=_watchdog_loop, daemon=True).start()
    threading.Thread(target=_boot_reconcile_loop, daemon=True).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
