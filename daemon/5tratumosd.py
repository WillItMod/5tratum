#!/usr/bin/env python3
import argparse
import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import shlex
import subprocess
import sys
import tarfile
import threading
import time
import urllib.error
import urllib.request
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
SESSION_CONFIG_FILE = str(_env("SESSION_CONFIG_FILE", "/etc/5tratumos/session.json") or "/etc/5tratumos/session.json")
UPDATE_TOKEN_ENV = str(_env("UPDATE_TOKEN", "") or os.environ.get("GITHUB_TOKEN") or "").strip()
UPDATE_ALLOW_UNVERIFIED = str(_env("UPDATE_ALLOW_UNVERIFIED", "0") or "0").strip() == "1"
SESSION_TTL_S = int(str(_env("SESSION_TTL_S", "86400") or "86400"))
SESSION_COOKIE = str(_env("SESSION_COOKIE", "5tratumos_session") or "5tratumos_session")
_AUTH_LOCK = threading.Lock()
_SESSIONS: dict[str, dict] = {}

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
    return subprocess.run(
        args,
        cwd=cwd,
        timeout=timeout_s,
        input=input,
        capture_output=True,
        text=True,
        check=False,
    )


def _write_json_atomic(path: str, obj: dict) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = f"{path}.tmp"
    raw = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(raw)
    os.replace(tmp, path)


def _read_json(path: str) -> dict:
    if not os.path.isfile(path):
        return {}
    try:
        obj = json.loads(Path(path).read_text(encoding="utf-8"))
    except Exception:
        return {}
    return obj if isinstance(obj, dict) else {}


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


def _write_update_config(cfg: dict) -> None:
    _write_json_atomic(UPDATE_CONFIG_FILE, cfg)
    try:
        os.chmod(UPDATE_CONFIG_FILE, 0o600)
    except Exception:
        pass


def update_repo() -> str:
    repo = str(_read_update_config().get("repo") or "").strip()
    if repo:
        return repo
    return str(UPDATE_REPO or "").strip()


def update_token() -> str:
    cfg = _read_update_config()
    tok = str(cfg.get("token") or cfg.get("github_token") or "").strip()
    if tok:
        return tok
    return str(UPDATE_TOKEN_ENV or "").strip()


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


_UPDATE_LOCK = threading.Lock()
_UPDATE_STATUS_PATH = os.path.join(STATE_DIR, "update", "status.json")
_UPDATE_REPO_RE = re.compile(r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$")


def update_status_read() -> dict:
    st = _read_json(_UPDATE_STATUS_PATH)
    if not st:
        return {"ok": True, "state": "idle", "time": _now_iso()}

    state = str(st.get("state") or "idle").strip().lower() or "idle"
    target = str(st.get("target_tag") or "").strip()
    build = read_build_info()
    installed = str(build.get("tag") or build.get("version") or "").strip()

    # If the last step was "restart daemon" and we are back online with the target tag, mark done.
    if state in {"restarting_daemon", "restarting"} and target and installed == target:
        st = {**st, "state": "done", "time": _now_iso(), "ok": True}
        try:
            _write_json_atomic(_UPDATE_STATUS_PATH, st)
        except Exception:
            pass
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


def _github_json(url: str, *, timeout_s: int = 15) -> dict | list | None:
    token = update_token()
    headers = {
        "User-Agent": "5tratumOS",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout_s) as r:  # nosec - expected HTTPS
        raw = r.read().decode("utf-8", errors="replace")
    try:
        return json.loads(raw)
    except Exception:
        return None


def _github_bytes(url: str, *, timeout_s: int = 60) -> bytes:
    token = update_token()
    headers = {"User-Agent": "5tratumOS"}
    if "/releases/assets/" in url:
        headers["Accept"] = "application/octet-stream"
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout_s) as r:  # nosec - expected HTTPS
        return r.read()


def _select_release(channel: str) -> dict:
    repo = str(update_repo() or "").strip()
    if not repo or "/" not in repo:
        return {"ok": False, "error": f"invalid update repo: {repo}"}
    ch = (channel or "main").strip().lower() or "main"

    if ch in {"main", "dev"}:
        url = f"https://api.github.com/repos/{repo}/releases?per_page=30"
        try:
            data = _github_json(url, timeout_s=15)
        except urllib.error.HTTPError as e:
            if e.code in (401, 403, 404):
                return {"ok": False, "error": "unauthorized (private repo?) or not found"}
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
    cfg = _read_update_config()
    repo_cfg = str(cfg.get("repo") or "").strip()
    tok_cfg = str(cfg.get("token") or cfg.get("github_token") or "").strip()
    tok_env = str(UPDATE_TOKEN_ENV or "").strip()
    token_present = bool(tok_cfg or tok_env)
    return {
        "ok": True,
        "repo": str(update_repo()),
        "repo_source": "config" if repo_cfg else "env",
        "token_configured": token_present,
        "token_source": "config" if tok_cfg else ("env" if tok_env else "none"),
        "allow_unverified": bool(UPDATE_ALLOW_UNVERIFIED),
    }


def system_update_config_set(body: dict) -> dict:
    if not isinstance(body, dict):
        return {"ok": False, "error": "invalid body"}

    cfg = _read_update_config()

    if "repo" in body:
        repo = str(body.get("repo") or "").strip()
        if not repo:
            cfg.pop("repo", None)
        else:
            if not _UPDATE_REPO_RE.fullmatch(repo):
                return {"ok": False, "error": "repo must look like 'owner/repo'"}
            cfg["repo"] = repo

    if "token" in body or "github_token" in body:
        token = str(body.get("token") or body.get("github_token") or "").strip()
        if not token:
            cfg.pop("token", None)
            cfg.pop("github_token", None)
        else:
            cfg["token"] = token

    _write_update_config(cfg)
    return {**system_update_config_get(), "saved": True}


def system_update_check(channel: str | None = None) -> dict:
    ch = (channel or read_default_channel() or "main").strip().lower() or "main"
    sel = _select_release(ch)
    build = read_build_info()
    installed_tag = str(build.get("tag") or build.get("version") or "unknown").strip() or "unknown"
    if not sel.get("ok"):
        return {
            "ok": True,
            "channel": ch,
            "installed": {"tag": installed_tag},
            "available": None,
            "update_available": False,
            "error": sel.get("error") or "",
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

    verifiable = bool(sha256) or UPDATE_ALLOW_UNVERIFIED
    update_available = bool(tag and tag != installed_tag and verifiable)
    return {
        "ok": True,
        "channel": ch,
        "repo": str(update_repo()),
        "installed": {"tag": installed_tag},
        "available": {
            "tag": tag,
            "published_at": published_at,
            "notes": body,
            "bundle": {"name": bundle_name, "url": bundle_url, "sha256": sha256 or ""},
            "verifiable": bool(sha256),
        },
        "update_available": bool(update_available),
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


def system_update_apply(channel: str | None = None) -> dict:
    ch = (channel or read_default_channel() or "main").strip().lower() or "main"
    with _UPDATE_LOCK:
        st = update_status_read()
        if str(st.get("state") or "").strip().lower() in {"downloading", "extracting", "deploying", "restarting", "restarting_daemon"}:
            return {"ok": False, "error": "update already in progress"}

        check = system_update_check(ch)
        if not check.get("ok"):
            return {"ok": False, "error": "unable to check updates"}
        if not check.get("available"):
            return {"ok": False, "error": check.get("error") or "no updates available"}
        if not check.get("update_available"):
            return {"ok": False, "error": check.get("error") or "no verified update available"}

        target = check.get("available") or {}
        bundle = (target.get("bundle") or {}) if isinstance(target, dict) else {}
        target_tag = str(target.get("tag") or "").strip()
        bundle_url = str(bundle.get("url") or "").strip()
        bundle_sha = str(bundle.get("sha256") or "").strip().lower()
        if not target_tag or not bundle_url:
            return {"ok": False, "error": "invalid release metadata"}
        if not bundle_sha and not UPDATE_ALLOW_UNVERIFIED:
            return {"ok": False, "error": "no checksum for update bundle (refusing unverified update)"}

        def worker() -> None:
            try:
                update_status_write("downloading", target_tag=target_tag)
                os.makedirs(os.path.join(STATE_DIR, "update"), exist_ok=True)
                bundle_path = os.path.join(STATE_DIR, "update", "bundle.tgz")
                stage_dir = os.path.join(STATE_DIR, "update", f"stage-{int(time.time())}")
                tmp = bundle_path + ".tmp"
                Path(tmp).write_bytes(_github_bytes(bundle_url, timeout_s=600))
                os.replace(tmp, bundle_path)

                if bundle_sha:
                    got = _sha256_file(bundle_path)
                    if got.lower() != bundle_sha.lower():
                        update_status_write("error", target_tag=target_tag, error="checksum mismatch")
                        return

                update_status_write("extracting", target_tag=target_tag)
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

                stage_root = Path(stage_dir)
                stage_overlay = stage_root / "overlay"
                stage_daemon = stage_root / "daemon"
                stage_systemd = stage_root / "systemd"
                stage_bin = stage_root / "bin" / "5tratumos"

                cur_overlay = Path(ROOT_DIR) / "overlay"
                cur_daemon = Path(ROOT_DIR) / "daemon"
                cur_systemd = Path("/etc/systemd/system")

                daemon_changed = stage_daemon.is_dir() and _tree_digest(str(stage_daemon)) != _tree_digest(str(cur_daemon))
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
                    restarts={
                        "overlay": bool(overlay_cfg_changed),
                        "daemon": bool(daemon_changed),
                        "systemd": bool(systemd_changed),
                    },
                )

                if stage_overlay.is_dir():
                    _mirror_tree(str(stage_overlay), str(cur_overlay))
                if stage_daemon.is_dir():
                    _mirror_tree(str(stage_daemon), str(cur_daemon))
                if (stage_root / "apps-available").is_dir():
                    _mirror_tree(str(stage_root / "apps-available"), str(Path(ROOT_DIR) / "apps-available"))
                if (stage_root / "console").is_dir():
                    _mirror_tree(str(stage_root / "console"), str(Path(ROOT_DIR) / "console"))

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
                    update_status_write("restarting", target_tag=target_tag, service="overlay")
                    run_cmd(["systemctl", "restart", "5tratumos-overlay.service"], timeout_s=180)

                if daemon_changed:
                    update_status_write("restarting_daemon", target_tag=target_tag, service="daemon")
                    run_cmd(["systemctl", "restart", "5tratumosd.service"], timeout_s=180)
                    return

                update_status_write("done", target_tag=target_tag)
            except Exception as e:
                update_status_write("error", target_tag=target_tag, error=str(e))

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


def auth_status(handler: BaseHTTPRequestHandler) -> dict:
    with _AUTH_LOCK:
        auth = _read_auth()
    users = auth.get("users") if isinstance(auth.get("users"), list) else []
    needs_setup = len(users) == 0
    user = current_user(handler)
    return {"ok": True, "authed": bool(user), "user": user, "needs_setup": needs_setup, "time": _now_iso()}


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

    # Global store uses canonical IDs like "bitcoin", "nextcloud", etc.
    if ch == "global":
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
    if ch not in {"main", "dev", "global"}:
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
                "installable": bool(installable),
            }
        )

    if ch in {"main", "dev"}:
        if not any(str(a.get("id") or "").strip().lower() == "axedoom" for a in apps):
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
                    "icon": "",
                    "gallery": [],
                    "port": 5300,
                    "path": "",
                    "widgets": [],
                    "installable": True,
                }
            )

    _STORE_CACHE[ch] = {"time": now, "apps": apps}
    return {"ok": True, "channel": ch, "apps": apps}


def store_app_by_id(app_id: str) -> dict | None:
    app_id = (app_id or "").strip().lower()
    if not app_id:
        return None
    for ch in ("main", "dev", "global"):
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
    if not app_id or ch not in {"main", "dev", "global"}:
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


def _fetch_json(url: str, *, timeout_s: int = 2) -> dict | list | str | int | float | bool | None:
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout_s) as resp:  # noqa: S310
        raw = resp.read().decode("utf-8", errors="replace")
    return json.loads(raw)


def list_app_widgets() -> dict:
    cache = _WIDGET_CACHE.get("widgets") or {}
    now = time.time()
    if cache.get("time") and now - float(cache.get("time") or 0) < 3:
        return {"ok": True, "time": _now_iso(), "apps": cache.get("apps") or []}

    apps_out: list[dict] = []

    for app_id in list_installed_app_ids():
        store_meta = store_app_by_id(app_id) or {}
        widgets = store_meta.get("widgets") or []
        if not isinstance(widgets, list) or not widgets:
            continue

        port = default_ui_ports(app_id)
        if port is None:
            try:
                sp = int(str(store_meta.get("port") or "").strip() or "0")
            except Exception:
                sp = 0
            port = sp or None

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
            try:
                w["data"] = _fetch_json(url, timeout_s=2)
                w["ok"] = True
            except Exception as e:
                w["error"] = str(e)
            app_entry["widgets"].append(w)

        apps_out.append(app_entry)

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

    for app_id in list_installed_app_ids():
        store_meta = store_app_by_id(app_id) or {}
        if not isinstance(store_meta, dict) or not _has_pool_widget(store_meta):
            continue

        name = str(store_meta.get("name") or app_id).strip() or app_id
        coin = name[3:].strip().upper() if name.lower().startswith("axe") else name.strip().upper()
        if not coin:
            coin = app_id.upper()

        port = default_ui_ports(app_id)
        if port is None:
            try:
                sp = int(str(store_meta.get("port") or "").strip() or "0")
            except Exception:
                sp = 0
            port = sp or None

        project = docker_compose_project(app_id)
        st = summarize_project_status(project)
        status = str(st.get("status") or "unknown")

        entry: dict = {
            "id": app_id,
            "name": name,
            "coin": coin,
            "status": status,
            "port": port,
            "ok": False,
        }

        if status != "running" or port is None:
            entry["pool_error"] = "not running"
            entry["workers_error"] = "not running"
            pools.append(entry)
            continue

        pool_url = f"http://127.0.0.1:{port}/api/pool"
        workers_url = f"http://127.0.0.1:{port}/api/pool/workers"

        pool_data: dict | None = None
        workers_data: dict | None = None

        try:
            pool_raw = _fetch_json(pool_url, timeout_s=2)
            if isinstance(pool_raw, dict):
                pool_data = pool_raw
            else:
                entry["pool_error"] = "invalid pool response"
        except Exception as e:
            entry["pool_error"] = str(e)

        try:
            workers_raw = _fetch_json(workers_url, timeout_s=2)
            if isinstance(workers_raw, dict):
                workers_data = workers_raw
            else:
                entry["workers_error"] = "invalid workers response"
        except Exception as e:
            entry["workers_error"] = str(e)

        if pool_data is not None:
            entry["pool"] = pool_data
            try:
                total_hashrate_ths += float(pool_data.get("hashrate_ths") or 0.0)
            except Exception:
                pass
            try:
                total_workers += int(pool_data.get("workers") or 0)
            except Exception:
                pass

        if workers_data is not None:
            entry["workers"] = workers_data
            details = workers_data.get("workers_details")
            if isinstance(details, list):
                for w in details:
                    if not isinstance(w, dict):
                        continue
                    workers_out.append({"app_id": app_id, "coin": coin, **w})

        entry["ok"] = pool_data is not None
        pools.append(entry)

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

    workers_out.sort(key=worker_hashrate_key, reverse=True)
    if limit > 0:
        workers_out = workers_out[:limit]

    res = {
        "ok": True,
        "time": _now_iso(),
        "total": {"hashrate_ths": total_hashrate_ths, "workers": total_workers},
        "pools": pools,
        "workers": workers_out,
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


def system_metrics() -> dict:
    try:
        load1, load5, load15 = os.getloadavg()
    except Exception:
        load1, load5, load15 = 0.0, 0.0, 0.0

    per_core, total_perc = cpu_utilization_perc()

    meminfo = read_meminfo_bytes()
    total = int(meminfo.get("MemTotal", 0))
    avail = int(meminfo.get("MemAvailable", 0))
    used = max(0, total - avail) if total and avail else 0

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
        },
        "memory": {
            "total_bytes": total,
            "available_bytes": avail,
            "used_bytes": used,
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
            cpu = float(cpu_s)
        except Exception:
            cpu = None
        try:
            mem = float(mem_s)
        except Exception:
            mem = None
        try:
            rss_kb = int(float(rss_s))
        except Exception:
            rss_kb = None
        out.append(
            {
                "pid": pid,
                "user": user,
                "command": comm,
                "cpu_perc": cpu,
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
_SSH_ADMIN_USER = str(_env("SSH_ADMIN_USER", "admin") or "admin")


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
    admin = _unix_user_password_state(_SSH_ADMIN_USER)
    return {
        "ok": True,
        "installed": True,
        "enabled": enabled,
        "active": active,
        "service": svc,
        "admin_user": _SSH_ADMIN_USER,
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
        ensure = _ensure_unix_user(_SSH_ADMIN_USER)
        if not ensure.get("ok"):
            return {"ok": False, "error": f"failed to ensure admin user '{_SSH_ADMIN_USER}': {ensure.get('error')}"}

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
    user = _SSH_ADMIN_USER
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

    user = _SSH_ADMIN_USER
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
    if not containers:
        return {"status": "not-created", "containers": []}
    any_running = False
    any_restarting = False
    any_exited = False
    for c in containers:
        status = str(c.get("Status", ""))
        if status.startswith("Up "):
            any_running = True
        if status.startswith("Restarting"):
            any_restarting = True
        if status.startswith("Exited"):
            any_exited = True
    if any_restarting:
        status = "restarting"
    elif any_running:
        status = "running"
    elif any_exited:
        status = "stopped"
    else:
        status = "unknown"
    return {"status": status, "containers": containers}


def default_ui_ports(app_id: str) -> int | None:
    # Transitional: until apps are proxied via internal networks, we map known UIs.
    return {"axelive": 5210, "axebench": 5000, "axedoom": 5300}.get(app_id)


def _nginx_proxy_block(app_id: str, port: int) -> str:
    aid = str(app_id or "").strip()
    p = int(port)
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
        if not store_port:
            dp = default_ui_ports(app_id)
            if dp:
                candidates.insert(0, int(dp))

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
        if sys_ch in {"main", "dev", "global"}:
            preferred_channels.append(sys_ch)
        if meta_ch in {"main", "dev", "global"} and meta_ch not in preferred_channels:
            preferred_channels.append(meta_ch)
        for ch in ("main", "dev", "global"):
            if ch not in preferred_channels:
                preferred_channels.append(ch)

        store_meta: dict = {}
        for ch in preferred_channels:
            m = store_app_by_id_in_channel(app_id, ch)
            if m:
                store_meta = m
                break

        store_port: int | None = default_ui_ports(app_id)
        if store_port is None:
            try:
                sp = int(str(store_meta.get("port") or "").strip() or "0")
            except Exception:
                sp = 0
            store_port = sp or None

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

        if path == "/api/v0/system/session":
            json_response(self, HTTPStatus.OK, system_session_config_get())
            return

        if path == "/api/v0/system/proxy":
            json_response(self, HTTPStatus.OK, {"ok": True, "repair": "/api/v0/system/proxy/repair"})
            return

        if path == "/api/v0/system/update/check":
            channel = None
            if "channel" in qs and qs["channel"]:
                channel = qs["channel"][0]
            json_response(self, HTTPStatus.OK, system_update_check(channel))
            return

        if path == "/api/v0/system/update/config":
            json_response(self, HTTPStatus.OK, system_update_config_get())
            return

        if path == "/api/v0/system/update/status":
            json_response(self, HTTPStatus.OK, update_status_read())
            return

        if path == "/api/v0/apps/installed":
            apps = []
            for app_id in list_installed_app_ids():
                install_meta = read_app_install_meta(app_id)
                meta_ch = str(install_meta.get("channel") or "").strip().lower()
                preferred_channels: list[str] = []
                sys_ch = str(read_default_channel() or "").strip().lower()
                if sys_ch in {"main", "dev", "global"}:
                    preferred_channels.append(sys_ch)
                if meta_ch in {"main", "dev", "global"} and meta_ch not in preferred_channels:
                    preferred_channels.append(meta_ch)
                for ch in ("main", "dev", "global"):
                    if ch not in preferred_channels:
                        preferred_channels.append(ch)

                store_meta: dict = {}
                for ch in preferred_channels:
                    m = store_app_by_id_in_channel(app_id, ch)
                    if m:
                        store_meta = m
                        break
                project = docker_compose_project(app_id)
                st = summarize_project_status(project)
                resources = summarize_resources(st.get("containers") or [])
                port = default_ui_ports(app_id)
                if port is None:
                    try:
                        sp = int(str(store_meta.get("port") or "").strip() or "0")
                    except Exception:
                        sp = 0
                    port = sp or None

                installed_version = str(install_meta.get("installed_version") or "").strip()
                if not installed_version:
                    inferred = infer_installed_version(project, st.get("containers") or [])
                    if inferred:
                        installed_version = inferred
                latest_version = str(store_meta.get("version") or "").strip()
                if not installed_version and latest_version:
                    installed_version = latest_version
                update_available = is_update_available(installed_version, latest_version)
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
                        "ui": {
                            "path": f"/apps/{app_id}/",
                            "port": port,
                        },
                    }
                )
            json_response(self, HTTPStatus.OK, {"ok": True, "apps": apps})
            return

        if path == "/api/v0/apps/widgets":
            json_response(self, HTTPStatus.OK, list_app_widgets())
            return

        if path == "/api/v0/fleet/summary":
            limit = None
            if "limit" in qs and qs["limit"]:
                try:
                    limit = int(str(qs["limit"][0]).strip() or "0")
                except Exception:
                    limit = None
            json_response(self, HTTPStatus.OK, axe_fleet_summary(limit_workers=limit))
            return

        if path == "/api/v0/apps/available":
            channel = None
            if "channel" in qs and qs["channel"]:
                channel = qs["channel"][0]
            json_response(self, HTTPStatus.OK, list_available_app_ids(channel))
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

        if path.startswith("/api/v0/") and not current_user(self):
            json_response(self, HTTPStatus.UNAUTHORIZED, {"ok": False, "error": "unauthorized"})
            return

        if path == "/api/v0/system/update/config":
            res = system_update_config_set(body if isinstance(body, dict) else {})
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

        if path == "/api/v0/system/session":
            res = system_session_config_set(body if isinstance(body, dict) else {})
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

        m = re.fullmatch(r"/api/v0/apps/([a-z0-9][a-z0-9_-]*)/(install|uninstall|update|rollback|up|down|pull|redeploy)", path)
        if m:
            app_id, action = m.group(1), m.group(2)

            if action == "install":
                channel = body.get("channel")
                if channel:
                    res = stratumos_cmd(["app", "install", app_id, "--channel", str(channel)], timeout_s=600)
                else:
                    res = stratumos_cmd(["app", "install", app_id], timeout_s=600)
                json_response(self, HTTPStatus.OK if res["ok"] else HTTPStatus.BAD_REQUEST, res)
                return

            if action == "uninstall":
                purge = bool(body.get("purge")) if isinstance(body, dict) else False
                args = ["app", "uninstall", app_id]
                if purge:
                    args.append("--purge")
                res = stratumos_cmd(args, timeout_s=600)
                json_response(self, HTTPStatus.OK if res["ok"] else HTTPStatus.BAD_REQUEST, res)
                return

            if action == "update":
                channel = str(body.get("channel") or "") if isinstance(body, dict) else ""
                channel = channel.strip().lower()
                args = ["app", "update", app_id]
                if channel in {"main", "dev", "global"}:
                    args += ["--channel", channel]
                res = stratumos_cmd(args, timeout_s=1800)
                json_response(self, HTTPStatus.OK if res["ok"] else HTTPStatus.BAD_REQUEST, res)
                return

            if action == "rollback":
                version = str(body.get("version") or body.get("to") or "") if isinstance(body, dict) else ""
                version = version.strip()
                args = ["app", "rollback", app_id]
                if version:
                    args += ["--to", version]
                res = stratumos_cmd(args, timeout_s=1800)
                json_response(self, HTTPStatus.OK if res["ok"] else HTTPStatus.BAD_REQUEST, res)
                return

            if action == "up":
                res = stratumos_cmd(["app", "up", app_id], timeout_s=1800)
                json_response(self, HTTPStatus.OK if res["ok"] else HTTPStatus.BAD_REQUEST, res)
                return

            if action == "down":
                res = stratumos_cmd(["app", "down", app_id], timeout_s=600)
                json_response(self, HTTPStatus.OK if res["ok"] else HTTPStatus.BAD_REQUEST, res)
                return

            if action == "pull":
                res = stratumos_cmd(["app", "pull", app_id], timeout_s=1800)
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

                json_response(
                    self,
                    HTTPStatus.OK if ok else HTTPStatus.BAD_REQUEST,
                    {"ok": ok, "app": app_id, "steps": steps},
                )
                return

        json_response(self, HTTPStatus.NOT_FOUND, {"ok": False, "error": "not found"})


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=9000)
    args = parser.parse_args()

    server = ThreadingHTTPServer((args.host, args.port), Handler)
    sys.stderr.write(f"5tratumosd listening on http://{args.host}:{args.port}\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
