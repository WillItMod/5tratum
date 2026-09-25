"""Offline ordering and failure tests for the actual repair entry point."""
import contextlib
import copy
import io
from pathlib import Path
import tempfile
from unittest import mock

from test_john_repair import OfflineCase, repair, host, snapshot, KERNEL, VERSION


class ApplyWorkflowTests(OfflineCase):
    def exercise(self, install_failure=False, changed_plan=False):
        events, saved = [], []
        plan = {"packages": {p: {"version": VERSION, "installed": None,
                                 "origins": [("https://deb.debian.org/debian", "trixie/non-free-firmware")]}
                             for p in repair.FIRMWARE},
                "targetKernel": KERNEL, "kernelMessage": "Firmware-only test."}
        second = copy.deepcopy(plan)
        if changed_plan:
            second["packages"][repair.FIRMWARE[0]]["version"] = "20250410-3"

        def command(args, **kwargs):
            events.append(tuple(args))
            if args[0] == "apt-get" and "install" in args and install_failure:
                raise repair.Stop("Simulated interrupted package installation")
            return ""

        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            backup = root / "backup"
            backup.mkdir()
            with contextlib.ExitStack() as stack:
                patches = [
                    mock.patch.object(repair.platform, "system", return_value="Linux"),
                    mock.patch.object(repair.os, "geteuid", return_value=0),
                    mock.patch.object(repair.os, "umask"),
                    mock.patch.object(repair.os, "open", return_value=91),
                    mock.patch.object(repair.os, "fdopen", return_value=mock.MagicMock()),
                    mock.patch.object(repair.fcntl, "flock"),
                    mock.patch.object(repair.os, "chown"),
                    mock.patch.object(repair.Path, "cwd", return_value=root),
                    mock.patch.object(repair, "STATE", root / "state.json"),
                    mock.patch.object(repair, "MENU_CONFIG", root / "menu/support.cfg"),
                    mock.patch.object(repair, "system_info", return_value=host()),
                    mock.patch.object(repair, "snapshot", side_effect=lambda _: snapshot()),
                    mock.patch.object(repair, "healthy_dpkg", return_value=set()),
                    mock.patch.object(repair, "make_plan", side_effect=[copy.deepcopy(plan), second]),
                    mock.patch.object(repair, "simulate", return_value=[]),
                    mock.patch.object(repair, "backup", side_effect=lambda *a: events.append("backup") or backup),
                    mock.patch.object(repair, "run", side_effect=command),
                    mock.patch.object(repair, "save", side_effect=lambda p, d: saved.append((str(p), copy.deepcopy(d)))),
                    mock.patch.object(repair, "package_status", return_value=VERSION),
                    mock.patch.object(repair, "disk_firmware", return_value=dict.fromkeys(repair.FILES, True)),
                    mock.patch.object(repair, "initrd_firmware", return_value={
                        "present": True, "requiredFiles": list(repair.FILES),
                        "files": dict.fromkeys(repair.FILES, True)}),
                    mock.patch.object(repair, "read", return_value="  linux /vmlinuz-" + KERNEL + "\n  initrd /initrd.img-" + KERNEL),
                ]
                for patch in patches:
                    stack.enter_context(patch)
                stack.enter_context(contextlib.redirect_stdout(io.StringIO()))
                result = repair.main(["--repair"])
        return result, events, saved

    def test_backup_precedes_install_and_success_requires_boot_verification(self):
        result, events, saved = self.exercise()
        install_at = next(i for i, event in enumerate(events)
                          if isinstance(event, tuple) and event[0] == "apt-get" and "install" in event)
        self.assertLess(events.index("backup"), install_at)
        self.assertEqual(result, 0)
        self.assertEqual(saved[-1][1]["result"], "REBOOT_REQUIRED")
        self.assertIn("awaiting-reboot", [data.get("status") for _, data in saved])
        self.assertTrue(any(event[0] == "apt-mark" and event[1] == "manual"
                            for event in events if isinstance(event, tuple)))
        self.assertFalse(any(event[0] in {"reboot", "shutdown", "systemctl"}
                             for event in events if isinstance(event, tuple)))

    def test_install_failure_records_incomplete_and_does_not_modify_boot_menu(self):
        result, events, saved = self.exercise(install_failure=True)
        self.assertEqual(result, 2)
        self.assertIn("incomplete", [data.get("status") for _, data in saved])
        self.assertFalse(any(event[0] in {"update-initramfs", "update-grub", "reboot"}
                             for event in events if isinstance(event, tuple)))

    def test_plan_change_after_backup_aborts_before_package_install(self):
        result, events, saved = self.exercise(changed_plan=True)
        self.assertEqual(result, 2)
        self.assertFalse(any(event[0] == "apt-get" and "install" in event
                             for event in events if isinstance(event, tuple)))
        self.assertNotIn("installing", [data.get("status") for _, data in saved])
