# GMKtec NucBox M6 support repair

A support-directed firmware repair and optional kernel update for **Debian 13 amd64 on a GMKtec NucBox M6**. It repairs missing AMD Yellow Carp and MediaTek MT7922 firmware. A newer supported Debian kernel is installed only when explicitly requested and available. This is **not a proven cure for an unidentified kernel crash**.

## Run on the node

Log into the affected node's terminal or SSH session. Paste this complete block there:

```sh
cd ~ &&
curl --fail --show-error --location --proto '=https' --tlsv1.2 \
  'https://raw.githubusercontent.com/WillItMod/5tratum/main/support/gmktec-m6/5tratumos-m6-repair.py' \
  -o 5tratumos-m6-repair.py &&
printf '%s\n' 'f60a4c754539e8efe08dc578a3f1a36e218bb3a2bdd280230dda566702e9ae2f  5tratumos-m6-repair.py' | sha256sum -c - &&
sudo python3 ./5tratumos-m6-repair.py --repair --update-kernel
```

The download must pass its SHA-256 check before the script can run. Enter the node's Linux password if sudo requests it. Keep the terminal open and power connected until installation finishes. The script never automatically reboots.

A read-only check, which writes a local report and tool lock, is available after downloading:

```sh
sudo python3 ~/5tratumos-m6-repair.py --check --update-kernel
```

Omit `--update-kernel` from a repair command for firmware-only repair, if support has requested that approach.

## After installation

1. Wait for **Repair installed**. If the script stops or requests support review, send its report through your existing private support conversation. If an installation did not finish, wait for support before rebooting.
2. After successful installation, use **Restart** in the OS power menu. A five-second recovery menu appears; let the normal entry start.
3. Once the machine returns, wait two minutes and run this command in its terminal:

```sh
sudo python3 ~/5tratumos-m6-repair.py --repair --update-kernel
```

The second run verifies the new boot; it does not repeat installation. It checks the expected kernel, firmware files and relevant boot-image contents, AMD graphics initialization, and available current-boot kernel records. A boot check passes only with usable coverage and no detected matching faults. It does not establish that an intermittent freeze is cured.

Send the generated `john-repair-report-*.json` files to private support. The existing report/state names are retained for compatibility with the earlier support script. Reports contain system details and should not be posted in public GitHub issues.

Use normal workloads for 48 hours and then export diagnostics. If the problem recurs, record the exact time/timezone and export diagnostics once the node is accessible. If the node cannot boot, support can guide selection of the retained previous kernel under GRUB's Advanced options.

## Scope and recovery

- Accepts only the specified OS, architecture and model.
- Selects exact package versions from approved Debian 13 stable/security mirrors and rejects downgrades, held changes, removals and unrelated dependencies.
- Checks package state and free space; preserves existing boot images, relevant firmware files and configuration before installation.
- Keeps the previous kernel installed, rebuilds/verifies boot images and exposes a five-second recovery menu.
- Does not add repositories, bypass package authentication, flash the BIOS, replace CPU microcode, remove services, change mining settings, autoremove packages, or reboot automatically.
- Preserves state across reruns and stops for support if a previous attempt was incomplete.

The backup path is printed after installation and recorded in the report. These are file/configuration backups, not a complete package-manager rollback. Selecting an old kernel alone does not restore shared firmware or its original initramfs. Recovery decisions should use the actual node state and saved manifest.

## Validation

The package includes 52 offline safety/workflow tests. Run them from this folder:

```sh
python3 -m unittest discover -p 'test_*.py' -q
```

A separate read-only Debian 13 package simulation selected exactly the expected two firmware packages, the kernel metapackage and its image, with no removals. Installation and hardware activation still require verification on the affected machine. No diagnostic exports, credentials or private support reports are included in this folder.
