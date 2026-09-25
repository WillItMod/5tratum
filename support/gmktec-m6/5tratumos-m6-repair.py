#!/usr/bin/env python3
"""Targeted support repair for the GMKtec NucBox M6 on Debian 13.

Default: read-only check (apart from a local report). Explicit --repair installs
the two firmware packages; --update-kernel also permits a newer Debian kernel.
No automatic reboot, source edits, service removal, autoremove or microcode flash.
Rerun the same command after reboot to verify, without applying another repair.
"""
import argparse
import datetime as dt
import fcntl
import hashlib
import json
import os
from pathlib import Path
import platform
import re
import shlex
import shutil
import subprocess
import sys
import tarfile
import tempfile
import urllib.parse

VERSION = "1.0.1"
STATE = Path("/var/lib/5tratumos/john-support-repair.json")
BACKUPS = Path("/var/backups/5tratumos")
MENU_CONFIG = Path("/etc/default/grub.d/99-5tratumos-john-support.cfg")
FIRMWARE = ("firmware-amd-graphics", "firmware-mediatek")
FILES = tuple("amdgpu/yellow_carp_" + x + ".bin" for x in
              ("toc", "dmcub", "pfp", "sdma", "vcn")) + (
    "mediatek/WIFI_MT7922_patch_mcu_1_1_hdr.bin",
    "mediatek/WIFI_RAM_CODE_MT7922_1.bin",
    "mediatek/BT_RAM_CODE_MT7922_1_1_hdr.bin",
)
FAULT = re.compile(r"BUG:|Oops:|rcu:.*(?:detected stalls|kthread starved)|"
                   r"soft lockup|hard LOCKUP|blocked for more than|"
                   r"Out of memory:|oom-kill:|Killed process", re.I)
PKG = re.compile(r"^[a-z0-9][a-z0-9+.-]*(?::amd64)?$")
VER = re.compile(r"^[0-9][A-Za-z0-9.+:~_-]*$")


class Stop(Exception):
    pass


def clean(text):
    # Never include URL credentials or query tokens in shareable output.
    def url(m):
        try:
            p = urllib.parse.urlsplit(m.group(0))
            return urllib.parse.urlunsplit((p.scheme, p.hostname or "", p.path, "", ""))
        except ValueError:
            return "<redacted-url>"
    text = re.sub(r"https?://[^\s\"<>]+", url, str(text))
    return re.sub(r"(?i)(token|password|secret|authorization)(\s*[=:]\s*)\S+",
                  r"\1\2<redacted>", text)


def utc():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def read(path):
    try:
        return Path(path).read_text().strip()
    except (OSError, UnicodeError):
        return ""


def digest(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def run(args, timeout=90, okay=(0,)):
    env = dict(os.environ, LC_ALL="C", LANG="C", DEBIAN_FRONTEND="noninteractive",
               NEEDRESTART_MODE="l")
    # Do not kill an in-progress package installation: its caller uses timeout=None.
    try:
        p = subprocess.run(args, text=True, stdout=subprocess.PIPE,
                           stderr=subprocess.STDOUT, env=env, timeout=timeout)
    except (OSError, subprocess.TimeoutExpired) as e:
        raise Stop("Command unavailable or timed out: " + args[0]) from e
    if p.returncode not in okay:
        raise Stop("Command failed: " + " ".join(args[:3]) + "\n" + clean(p.stdout[-6000:]))
    return p.stdout


def save(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    fd, name = tempfile.mkstemp(prefix="." + path.name + ".", dir=path.parent)
    temp = Path(name)
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        os.fchmod(f.fileno(), 0o600)
        json.dump(data, f, indent=2)
        f.write("\n")
        f.flush()
        os.fsync(f.fileno())
    os.replace(temp, path)


def system_info():
    release = {}
    for line in read("/etc/os-release").splitlines():
        if "=" in line:
            k, v = line.split("=", 1)
            release[k] = v.strip('"')
    return {
        "id": release.get("ID"), "version": release.get("VERSION_ID"),
        "codename": release.get("VERSION_CODENAME"),
        "architecture": run(["dpkg", "--print-architecture"]).strip(),
        "kernel": platform.release(), "bootId": read("/proc/sys/kernel/random/boot_id"),
        "uptimeSeconds": float(read("/proc/uptime").split()[0]),
        "vendor": read("/sys/class/dmi/id/sys_vendor"),
        "model": read("/sys/class/dmi/id/product_name"),
        "biosVersion": read("/sys/class/dmi/id/bios_version"),
    }


def validate_host(info):
    if (info["id"], info["version"], info["architecture"]) != ("debian", "13", "amd64"):
        raise Stop("This repair is only for Debian 13 amd64. No installation was attempted.")
    if info["vendor"].lower().strip() != "gmktec" or info["model"].lower().strip() != "nucbox m6":
        raise Stop("This is not a supported GMKtec NucBox M6. No installation was attempted.")
    if not re.fullmatch(r"[0-9][A-Za-z0-9.+_-]+-amd64", info["kernel"]):
        raise Stop("Unrecognized running kernel; support must review it first.")


def package_status(name):
    out = run(["dpkg-query", "-W", "-f=${db:Status-Status}\t${Version}\n", name], okay=(0, 1))
    for line in out.splitlines():
        if line.startswith("installed\t"):
            return line.split("\t", 1)[1]
    return None


def parse_policy(text):
    candidate = None
    selected = False
    origins = []
    for line in text.splitlines():
        m = re.match(r"\s*Candidate:\s*(\S+)", line)
        if m:
            candidate = m.group(1)
        m = re.match(r"\s*(?:\*\*\*\s+)?(\S+)\s+\d+\s*$", line)
        if m and not m.group(1).isdigit():
            selected = m.group(1) == candidate
            continue
        if selected:
            m = re.match(r"\s*\d+\s+(\S+)\s+(\S+)\s+\S+\s+Packages\s*$", line)
            if m:
                origins.append((m.group(1), m.group(2)))
    if not candidate or not VER.fullmatch(candidate):
        raise Stop("No usable APT candidate. The report needs a support review.")
    return {"version": candidate, "origins": origins}


def trusted_candidate(name):
    if not PKG.fullmatch(name):
        raise Stop("Invalid package name.")
    result = parse_policy(run(["apt-cache", "policy", name]))
    if not result["origins"]:
        raise Stop(name + ": no repository source for the candidate.")
    for address, suite in result["origins"]:
        p = urllib.parse.urlsplit(address)
        host = (p.hostname or "").lower()
        official = host in {"deb.debian.org", "security.debian.org", "ftp.debian.org"} or bool(
            re.fullmatch(r"ftp\.[a-z]{2}\.debian\.org", host))
        if p.scheme not in {"http", "https"} or not official or p.username or p.password:
            raise Stop(name + ": repository needs a support review; it is not an approved Debian mirror.")
        if suite.split("/", 1)[0] not in {"trixie", "trixie-updates", "trixie-security"}:
            raise Stop(name + ": candidate is outside Debian 13 stable/security repositories.")
    installed = package_status(name)
    if installed and version_lt(result["version"], installed):
        raise Stop(name + ": refusing a downgrade.")
    result["installed"] = installed
    return result


def version_lt(a, b):
    p = subprocess.run(["dpkg", "--compare-versions", a, "lt", b],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if p.returncode not in (0, 1):
        raise Stop("Could not compare package versions.")
    return p.returncode == 0


def healthy_dpkg():
    if run(["dpkg", "--audit"]).strip():
        raise Stop("An unfinished package transaction needs support attention before repair.")
    pending = run(["dpkg-query", "-W", "-f=${binary:Package}\t${db:Status-Status}\n"])
    bad = [x for x in pending.splitlines() if x.split("\t")[-1] not in
           {"installed", "config-files", "not-installed"}]
    if bad:
        raise Stop("Packages have pending configuration or triggers. No repair was started.")
    return set(run(["apt-mark", "showhold"]).split())


def disk_firmware():
    return {name: any((Path("/usr/lib/firmware") / (name + suffix)).is_file()
                      for suffix in ("", ".xz", ".zst")) for name in FILES}


def initrd_firmware(kernel):
    image = Path("/boot/initrd.img-" + kernel)
    if not image.is_file():
        return {"present": False, "files": {}, "requiredFiles": []}
    listing = set(run(["lsinitramfs", str(image)], timeout=180).splitlines())
    if not listing:
        raise Stop("The boot image listing is empty.")
    modules = {Path(x).name.split(".ko", 1)[0] for x in listing if ".ko" in x}
    required = []
    if "amdgpu" in modules:
        required.extend(FILES[:5])
    if modules.intersection({"mt7921e", "mt7921_common"}):
        required.extend(FILES[5:7])
    if "btmtk" in modules:
        required.append(FILES[7])
    return {"present": True, "requiredFiles": required, "files": {
        name: any(prefix + name + suffix in listing
                  for prefix in ("usr/lib/firmware/", "lib/firmware/")
                  for suffix in ("", ".xz", ".zst")) for name in FILES}}


def initrd_ready(image):
    return (image.get("present") is True and set(image.get("files", {})) == set(FILES)
            and "requiredFiles" in image and set(image["requiredFiles"]).issubset(FILES)
            and all(image["files"][x] for x in image["requiredFiles"]))


def gpu_initialized():
    for card in Path("/sys/class/drm").glob("card*"):
        if re.fullmatch(r"card[0-9]+", card.name) and read(card / "device/vendor") == "0x1002":
            if (card / "device/driver").resolve().name == "amdgpu":
                return True
    return False


def boot_findings():
    out = run(["journalctl", "-k", "-b", "--no-pager", "-o", "cat", "-n", "30000"], timeout=60)
    lines = out.splitlines()
    usable = [x for x in lines if x.strip() and x.strip() != "-- No entries --"]
    firmware = sum(1 for x in lines if
                   (("yellow_carp" in x or "MT7922" in x) and
                    ("failed" in x.lower() or "error" in x.lower())) or "Fatal error during GPU init" in x)
    faults = [x for x in lines if FAULT.search(x)]
    return {"kernelFaultLines": len(faults), "firmwareFailureLines": firmware,
            "journalAvailable": bool(usable),
            "kernelBootStartPresent": any(x.startswith("Linux version ") for x in usable),
            "journalMayBeCapped": len(lines) >= 30000,
            "faultCategories": sorted({m.group(0) for x in faults if (m := FAULT.search(x))})}


def snapshot(info):
    return {"timeUTC": utc(), "system": info,
            "packages": {p: package_status(p) for p in FIRMWARE + ("linux-image-amd64", "amd64-microcode")},
            "firmwareOnDisk": disk_firmware(),
            "runningInitramfs": initrd_firmware(info["kernel"]),
            "amdGpuInitialized": gpu_initialized(),
            "currentBoot": boot_findings(),
            "tunnel": clean(run(["systemctl", "show", "bchn-tunnel.service", "--no-pager",
                                 "--property=LoadState,ActiveState,SubState,User,DynamicUser,NRestarts"], okay=(0, 1, 3, 4))) }


def make_plan(info, with_kernel):
    held = healthy_dpkg()
    packages = {p: trusted_candidate(p) for p in FIRMWARE}
    target_kernel = info["kernel"]
    kernel_message = "Kernel change was not requested."
    if with_kernel:
        meta = trusted_candidate("linux-image-amd64")
        data = run(["apt-cache", "show", "linux-image-amd64=" + meta["version"]])
        dependencies = re.findall(r"^Depends:\s*(.+)$", data, re.M)
        image_names = set(re.findall(r"\b(linux-image-[0-9][a-zA-Z0-9.+~_-]*-amd64)(?=[\s,(]|$)",
                                    " ".join(dependencies)))
        if len(image_names) != 1:
            raise Stop("Could not identify one signed Debian kernel dependency.")
        image_name = image_names.pop()
        image = trusted_candidate(image_name)
        running_version = package_status("linux-image-" + info["kernel"])
        if not running_version:
            raise Stop("The running kernel is not owned by the expected Debian package.")
        if version_lt(running_version, image["version"]):
            packages["linux-image-amd64"] = meta
            packages[image_name] = image
            target_kernel = image_name[len("linux-image-"):]
            kernel_message = "A newer supported Debian kernel will be installed; this is not a proven crash cure."
        else:
            kernel_message = "No newer Debian stable/security kernel candidate. This run cannot change the kernel fault."
    if held.intersection(packages):
        raise Stop("A proposed package is held. Support must review the hold; it will not be overridden.")
    return {"packages": packages, "targetKernel": target_kernel, "kernelMessage": kernel_message}


def validate_simulation(output, packages):
    actions = []
    for line in output.splitlines():
        if line.startswith(("Inst ", "Conf ", "Remv ", "Purg ")):
            action, name = line.split()[:2]
            name = name.removesuffix(":amd64")
            if action in {"Remv", "Purg"} or name not in packages:
                raise Stop("APT proposed an unrelated package change: " + clean(line))
            if action in {"Inst", "Conf"}:
                match = re.search(r"\((\S+)", line)
                if not match or match.group(1) != packages[name]["version"]:
                    raise Stop("APT proposed an unexpected version: " + clean(line))
            actions.append({"action": action, "package": name})
    if not actions:
        raise Stop("APT returned no package actions; support must review the plan.")
    return actions


def apt_args(plan):
    return ["apt-get", "-o", "Acquire::Retries=1", "-o", "Acquire::http::Timeout=30",
            "-o", "Acquire::https::Timeout=30", "-o", "APT::Get::AllowUnauthenticated=false",
            "-o", "Acquire::AllowInsecureRepositories=false", "--no-remove", "--no-install-recommends",
            "--reinstall", "install"] + [p + "=" + d["version"] for p, d in plan["packages"].items()]


def simulate(plan):
    return validate_simulation(run(apt_args(plan)[:1] + ["--simulate"] + apt_args(plan)[1:]), plan["packages"])


def check_boot_selection():
    if MENU_CONFIG.exists():
        raise Stop("A prior support boot-menu configuration exists without a completed repair state. Support must review it.")
    configs = [Path("/etc/default/grub")] + sorted(Path("/etc/default/grub.d").glob("*.cfg"))
    for path in configs:
        for line in read(path).splitlines():
            if re.match(r"\s*(?:export\s+)?GRUB_DEFAULT\s*=", line):
                value = line.split("=", 1)[1].strip()
                try:
                    parts = shlex.split(value, comments=True)
                except ValueError as e:
                    raise Stop("Cannot safely interpret the boot selection.") from e
                if parts != ["0"]:
                    raise Stop("A custom default boot selection needs support review. It will not be overwritten.")
    if shutil.which("grub-editenv"):
        values = run(["grub-editenv", "/boot/grub/grubenv", "list"])
        if any(x.startswith("next_entry=") and x.split("=", 1)[1] for x in values.splitlines()):
            raise Stop("A one-time boot selection is pending. Support must review it first.")


def backup(info, report, plan):
    images = [p for p in Path("/boot").glob("initrd.img-*") if p.is_file()]
    if not images or not Path("/boot/initrd.img-" + info["kernel"]).is_file():
        raise Stop("The running kernel has no boot image to preserve.")
    if not Path("/boot/vmlinuz-" + info["kernel"]).is_file():
        raise Stop("The running kernel image is missing from /boot.")
    if not Path("/boot/grub/grub.cfg").is_file() or not shutil.which("update-grub"):
        raise Stop("Unrecognized bootloader. Support must review the boot configuration.")
    check_boot_selection()
    if not package_status("linux-image-" + info["kernel"]):
        raise Stop("The running kernel is not owned by the expected Debian package.")
    initrd_bytes = sum(p.stat().st_size for p in images)
    firmware_bytes = sum(p.stat().st_size for d in ("amdgpu", "mediatek")
                         for p in (Path("/usr/lib/firmware") / d).rglob("*") if p.is_file())
    needs = {"/boot": max(768 * 1024**2, max(p.stat().st_size for p in images) * 3),
             "/var": initrd_bytes + firmware_bytes + 2 * 1024**3,
             "/var/tmp": 1024**3}
    for path, required in needs.items():
        if shutil.disk_usage(path).free < required:
            raise Stop("Not enough free space in " + path + ". No package installation was attempted.")
    folder = BACKUPS / ("john-support-" + dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ"))
    folder.mkdir(parents=True, mode=0o700, exist_ok=False)
    folder.chmod(0o700)
    originals = {}
    paths = list(images) + [Path("/boot/vmlinuz-" + info["kernel"]), Path("/boot/grub/grub.cfg"),
                           Path("/etc/default/grub")] + list(Path("/etc/default/grub.d").glob("*.cfg"))
    for p in paths:
        if not p.is_file():
            continue
        dest = folder / "files" / p.relative_to("/")
        dest.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        shutil.copy2(p, dest)
        before, after = digest(p), digest(dest)
        if before != after:
            raise Stop("Boot-image backup verification failed. No packages installed.")
        originals[str(p)] = before
    with tarfile.open(folder / "firmware-before.tar", "w") as archive:
        for name in ("amdgpu", "mediatek"):
            p = Path("/usr/lib/firmware") / name
            if p.exists():
                archive.add(p, arcname=name, recursive=True)
    manifest = {"toolVersion": VERSION, "createdUTC": utc(), "before": report,
                "plan": plan, "fileHashes": originals,
                "manualPackages": run(["apt-mark", "showmanual"]).split(),
                "firmwareBackupSHA256": digest(folder / "firmware-before.tar"),
                "createdBootMenuConfig": str(MENU_CONFIG),
                "rollbackLimit": "Boot/firmware file backups are not a complete package-manager rollback."}
    save(folder / "before.json", manifest)
    return folder


def verify(info, state, report):
    same_boot = info["bootId"] == state["bootId"]
    report["repair"] = state
    if same_boot:
        report["result"] = "REBOOT_REQUIRED" if state["status"] == "awaiting-reboot" else "SUPPORT_REVIEW_REQUIRED"
        print("The repair has already run. " + (
            "Reboot once, then run this same command again." if state["status"] == "awaiting-reboot"
            else "The previous repair did not finish. Give support this report; do not repeat installation."))
        return
    if state["status"] != "awaiting-reboot" and state["status"] != "verified":
        report["result"] = "SUPPORT_REVIEW_REQUIRED"
        print("The earlier repair was incomplete. Give support this report.")
        return
    target = state["targetKernel"]
    new_faults = report["currentBoot"]["kernelFaultLines"]
    firmware_failed = report["currentBoot"]["firmwareFailureLines"]
    image = report["runningInitramfs"]
    complete = (set(report["firmwareOnDisk"]) == set(FILES) and all(report["firmwareOnDisk"].values())
                and initrd_ready(image) and report.get("amdGpuInitialized") is True)
    passed = (info["kernel"] == target and complete and not new_faults and not firmware_failed
              and not report["currentBoot"]["journalMayBeCapped"]
              and report["currentBoot"].get("journalAvailable") is True
              and report["currentBoot"].get("kernelBootStartPresent") is True)
    report["result"] = "BOOT_CHECK_PASSED" if passed else "SUPPORT_REVIEW_REQUIRED"
    report["freezeFixProven"] = False
    print("Boot check passed. Firmware is present and no matching faults are recorded this boot."
          if passed else "The boot check found an unresolved issue. Give support the report.")
    print("This does not yet prove the freezes are fixed. Keep normal workloads and collect a new diagnostic export after 48 hours, or immediately if it freezes again.")
    if passed:
        state["status"] = "verified"
        state["verifiedUTC"] = utc()
        save(STATE, state)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repair", action="store_true", help="apply the reviewed firmware repair")
    parser.add_argument("--update-kernel", action="store_true", help="also allow a newer Debian 13 stable/security kernel")
    parser.add_argument("--check", action="store_true", help="check only; ignore prior repair state")
    args = parser.parse_args(argv)
    if args.check and args.repair:
        parser.error("--check and --repair cannot be combined")
    if platform.system() != "Linux":
        print("Run this on the target 5tratumOS machine, not on a Mac or Windows computer.")
        return 2
    if os.geteuid() != 0:
        original_args = sys.argv[1:] if argv is None else argv
        print("Run with sudo: " + shlex.join(["sudo", "python3", str(Path(__file__).resolve())] + original_args))
        return 2
    os.umask(0o077)
    # Lock only this tool; APT retains its own package-manager locking.
    lock_fd = os.open("/run/5tratumos-john-support.lock", os.O_WRONLY | os.O_CREAT | os.O_NOFOLLOW, 0o600)
    lock = os.fdopen(lock_fd, "w")
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        print("A copy of this repair is already running.")
        return 2
    report = {"toolVersion": VERSION, "timeUTC": utc(), "result": "CHECK_STARTED", "freezeFixProven": False}
    output = Path.cwd() / ("john-repair-report-" + dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ") + ".json")
    state = None
    try:
        info = system_info()
        report["system"] = info
        validate_host(info)
        print("Checking the GMKtec NucBox M6. This script never reboots automatically.")
        report.update(snapshot(info))
        if STATE.exists() and not args.check:
            state = json.loads(STATE.read_text())
            verify(info, state, report)
            return 0 if report["result"] in {"BOOT_CHECK_PASSED", "REBOOT_REQUIRED"} else 2
        if args.repair:
            healthy_dpkg()
            print("Refreshing Debian package information...")
            run(["apt-get", "-o", "APT::Update::Error-Mode=any", "-o", "Acquire::Retries=1",
                 "-o", "Acquire::http::Timeout=30", "-o", "Acquire::https::Timeout=30", "update"], timeout=300)
        plan = make_plan(info, args.update_kernel)
        plan["actions"] = simulate(plan)
        report["plan"] = plan
        print(plan["kernelMessage"])
        print("Packages: " + ", ".join(p + " " + x["version"] for p, x in plan["packages"].items()))
        if not args.repair:
            report["result"] = "CHECK_ONLY"
            print("Check complete. No packages or boot files changed.")
            return 0
        print("Saving and verifying existing boot files and firmware...")
        folder = backup(info, report, plan)
        # Refuse to use a changed plan if package state changed during the backup.
        current = make_plan(info, args.update_kernel)
        if current["packages"] != plan["packages"] or current["targetKernel"] != plan["targetKernel"]:
            raise Stop("Package state changed during preparation. No packages installed; rerun the check.")
        simulate(plan)
        state = {"status": "installing", "bootId": info["bootId"], "oldKernel": info["kernel"],
                 "targetKernel": plan["targetKernel"], "backup": str(folder), "startedUTC": utc()}
        save(STATE, state)
        # Keep the existing versioned kernel from automatic removal; never hold the metapackage.
        run(["apt-mark", "manual", "linux-image-" + info["kernel"]])
        print("Installing the exact reviewed packages. Do not interrupt power or close this terminal.")
        command = apt_args(plan)
        install_output = run(command[:1] + ["-y", "-o", "Dpkg::Options::=--force-confold"] + command[1:], timeout=None)
        (folder / "install-log.txt").write_text(clean(install_output))
        healthy_dpkg()
        for name, chosen in plan["packages"].items():
            if package_status(name) != chosen["version"]:
                raise Stop("Installed package version did not match the reviewed plan: " + name)
        if not all(disk_firmware().values()):
            raise Stop("Expected firmware files are still missing after installation.")
        # Module support may use either existing or newly installed target kernel.
        for kernel in sorted({info["kernel"], plan["targetKernel"]}):
            print("Verifying boot image for " + kernel + "...")
            run(["update-initramfs", "-u", "-k", kernel], timeout=None)
            image = initrd_firmware(kernel)
            if not initrd_ready(image):
                raise Stop("The boot image lacks firmware for an included driver. Support must review before reboot.")
        # Make the retained kernel reachable for local recovery; preserve boot selection.
        MENU_CONFIG.parent.mkdir(parents=True, exist_ok=True)
        with open(MENU_CONFIG, "x") as f:
            os.fchmod(f.fileno(), 0o644)
            f.write("# Temporary support recovery menu; remove after support closes this repair.\n"
                    "GRUB_TIMEOUT_STYLE=menu\nGRUB_TIMEOUT=5\nGRUB_RECORDFAIL_TIMEOUT=5\n")
        run(["update-grub"], timeout=None)
        grub = read("/boot/grub/grub.cfg")
        for kernel in {info["kernel"], plan["targetKernel"]}:
            if "vmlinuz-" + kernel not in grub or "initrd.img-" + kernel not in grub:
                raise Stop("A verified current/target kernel boot entry is missing. Contact support before reboot.")
        first_linux = re.search(r"^\s*(?:linux|linuxefi)\s+\S*vmlinuz-([^\s]+)", grub, re.M)
        if not first_linux or first_linux.group(1) != plan["targetKernel"]:
            raise Stop("The first Linux boot entry is not the intended kernel. Support must review before reboot.")
        state["status"] = "awaiting-reboot"
        state["finishedUTC"] = utc()
        save(STATE, state)
        report["repair"] = state
        report["result"] = "REBOOT_REQUIRED"
        print("Repair installed. Backup: " + str(folder))
        print("Save this report, reboot the machine once using the OS power menu, then run this same command again.")
        print("The next run verifies the new boot; it will not repeat installation.")
        return 0
    except (Stop, OSError, ValueError) as e:
        report["result"] = "SUPPORT_REVIEW_REQUIRED"
        report["error"] = clean(str(e))
        if state and state.get("status") == "installing":
            state["status"] = "incomplete"
            save(STATE, state)
            report["repair"] = state
            print("Installation or boot verification did not finish. Do not reboot yet; send support the report.")
        print("STOP: " + clean(str(e)))
        return 2
    finally:
        save(output, report)
        # Allow the invoking user to retrieve the sanitized report without sudo.
        uid, gid = os.environ.get("SUDO_UID", ""), os.environ.get("SUDO_GID", "")
        if uid.isdecimal() and gid.isdecimal():
            os.chown(output, int(uid), int(gid), follow_symlinks=False)
        print("Report to send support: " + str(output))


if __name__ == "__main__":
    sys.exit(main())
