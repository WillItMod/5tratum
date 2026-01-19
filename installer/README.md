# 5tratumOS Installer ISO (WIP)

This folder contains the build config for a bootable **installer ISO**.

The installer ISO boots into a minimal live environment and launches a guided, text-based installer that:
- lists disks
- prompts the user to select a target disk
- installs Debian 13 (Trixie) to the selected disk
- installs 5tratumOS (daemon + portal + templates) and enables services
- reboots

This is intended for USB installs and VM testing (mount ISO as CD-ROM at boot).

Build entrypoint: `installer/build-installer-iso.sh`.
