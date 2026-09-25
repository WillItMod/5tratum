"""Offline safety regressions for the standalone John support repair.

All command execution is blocked unless a test explicitly supplies a mock.
No APT, systemd, journal, node or real boot/state files are accessed.
"""
import contextlib
import copy
import importlib.util
import io
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest import mock


SCRIPT = Path(__file__).with_name("5tratumos-m6-repair.py")
SPEC = importlib.util.spec_from_file_location("john_repair_under_test", SCRIPT)
repair = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(repair)

VERSION = "20250410-2"
KERNEL = "6.12.73+deb13-amd64"
FIRMWARE_FILES = (
    "amdgpu/yellow_carp_toc.bin",
    "amdgpu/yellow_carp_dmcub.bin",
    "amdgpu/yellow_carp_pfp.bin",
    "amdgpu/yellow_carp_sdma.bin",
    "amdgpu/yellow_carp_vcn.bin",
    "mediatek/WIFI_MT7922_patch_mcu_1_1_hdr.bin",
    "mediatek/WIFI_RAM_CODE_MT7922_1.bin",
    "mediatek/BT_RAM_CODE_MT7922_1_1_hdr.bin",
)


def policy(candidate=VERSION, origins=None, other_versions=""):
    if origins is None:
        origins = [("https://deb.debian.org/debian", "trixie/non-free-firmware")]
    rows = "\n".join("        500 %s %s amd64 Packages" % x for x in origins)
    return ("firmware-amd-graphics:\n"
            "  Installed: (none)\n"
            f"  Candidate: {candidate}\n"
            "  Version table:\n"
            f"     {candidate} 500\n{rows}\n{other_versions}")


def host():
    return {"id": "debian", "version": "13", "architecture": "amd64",
            "codename": "trixie", "vendor": "GMKtec", "model": "NucBox M6",
            "kernel": KERNEL, "bootId": "new-boot", "uptimeSeconds": 120}


def snapshot():
    return {"amdGpuInitialized": True,
            "firmwareOnDisk": dict.fromkeys(FIRMWARE_FILES, True),
            "runningInitramfs": {"present": True,
                                 "requiredFiles": list(FIRMWARE_FILES),
                                 "files": dict.fromkeys(FIRMWARE_FILES, True)},
            "currentBoot": {"kernelFaultLines": 0, "firmwareFailureLines": 0,
                            "journalAvailable": True, "kernelBootStartPresent": True,
                            "journalMayBeCapped": False, "faultCategories": []}}


def state(status="awaiting-reboot"):
    return {"status": status, "bootId": "old-boot", "oldKernel": KERNEL,
            "targetKernel": KERNEL, "backup": "/synthetic/backup"}


class OfflineCase(unittest.TestCase):
    def setUp(self):
        self.addCleanup(mock.patch.stopall)
        self.block_subprocess = mock.patch.object(
            repair.subprocess, "run", side_effect=AssertionError("real subprocess forbidden")
        ).start()


class PolicyTests(OfflineCase):
    def test_candidate_origins_exclude_other_versions_and_dpkg_status(self):
        text = policy(other_versions=(
            " *** 20240220-1 100\n"
            "        100 /var/lib/dpkg/status\n"
            "        500 https://untrusted.invalid/repo trixie/main amd64 Packages\n"))
        self.assertEqual(repair.parse_policy(text), {
            "version": VERSION,
            "origins": [("https://deb.debian.org/debian", "trixie/non-free-firmware")]})

    def test_candidate_installed_marker_and_security_mirror_are_parsed(self):
        text = policy(origins=[("https://security.debian.org/debian-security",
                                "trixie-security/non-free-firmware")])
        text = text.replace(f"     {VERSION} 500", f" *** {VERSION} 500")
        self.assertEqual(repair.parse_policy(text)["origins"], [
            ("https://security.debian.org/debian-security", "trixie-security/non-free-firmware")])

    def test_missing_or_invalid_candidate_stops(self):
        for text in ("", "Candidate: (none)", "Candidate: file:///tmp/evil", "Candidate: 1;touch"):
            with self.subTest(text=text), self.assertRaises(repair.Stop):
                repair.parse_policy(text)

    def trusted(self, text, installed=None, downgrade=False):
        with mock.patch.object(repair, "run", return_value=text), \
                mock.patch.object(repair, "package_status", return_value=installed), \
                mock.patch.object(repair, "version_lt", return_value=downgrade):
            return repair.trusted_candidate("firmware-amd-graphics")

    def test_approved_stable_update_and_security_origins(self):
        for address, suite in (
            ("https://deb.debian.org/debian", "trixie/non-free-firmware"),
            ("http://ftp.uk.debian.org/debian", "trixie-updates/non-free-firmware"),
            ("https://security.debian.org/debian-security", "trixie-security/non-free-firmware"),
        ):
            with self.subTest(address=address, suite=suite):
                self.assertEqual(self.trusted(policy(origins=[(address, suite)]))["version"], VERSION)

    def test_foreign_origin_same_version_is_not_hidden_by_official_origin(self):
        origins = [("https://deb.debian.org/debian", "trixie/non-free-firmware"),
                   ("https://foreign.invalid/repo", "trixie/non-free-firmware")]
        with self.assertRaisesRegex(repair.Stop, "repository"):
            self.trusted(policy(origins=origins))

    def test_foreign_suite_credentials_lookalike_and_local_sources_stop(self):
        for address, suite in (
            ("https://deb.debian.org/debian", "sid/non-free-firmware"),
            ("https://deb.debian.org/debian", "trixie-backports/non-free-firmware"),
            ("https://name:password@deb.debian.org/debian", "trixie/non-free-firmware"),
            ("https://deb.debian.org.evil.invalid/debian", "trixie/non-free-firmware"),
            ("file:///local/debian", "trixie/non-free-firmware"),
        ):
            with self.subTest(address=address, suite=suite), self.assertRaises(repair.Stop):
                self.trusted(policy(origins=[(address, suite)]))

    def test_installed_only_candidate_without_repository_stops(self):
        with self.assertRaisesRegex(repair.Stop, "no repository"):
            self.trusted(policy(origins=[], other_versions="        100 /var/lib/dpkg/status"))

    def test_downgrade_stops_but_same_version_reinstall_is_allowed(self):
        with self.assertRaisesRegex(repair.Stop, "downgrade"):
            self.trusted(policy(), installed="20260410-1", downgrade=True)
        self.assertEqual(self.trusted(policy(), installed=VERSION)["installed"], VERSION)

    def test_invalid_package_name_never_executes_command(self):
        with mock.patch.object(repair, "run") as command, self.assertRaises(repair.Stop):
            repair.trusted_candidate("firmware-amd-graphics;reboot")
        command.assert_not_called()

    def test_version_comparison_uses_exit_status_and_rejects_errors(self):
        for code, expected in ((0, True), (1, False)):
            with self.subTest(code=code), mock.patch.object(
                    repair.subprocess, "run", return_value=subprocess.CompletedProcess([], code)):
                self.assertIs(repair.version_lt("1", "2"), expected)
        with mock.patch.object(repair.subprocess, "run", return_value=subprocess.CompletedProcess([], 2)), \
                self.assertRaises(repair.Stop):
            repair.version_lt("1", "bad")


class PlanTests(OfflineCase):
    def test_firmware_only_plan_never_requests_kernel_candidate(self):
        def candidate(name):
            self.assertIn(name, repair.FIRMWARE)
            return {"version": VERSION, "installed": None}
        with mock.patch.object(repair, "healthy_dpkg", return_value=set()), \
                mock.patch.object(repair, "trusted_candidate", side_effect=candidate) as trusted:
            result = repair.make_plan(host(), False)
        self.assertEqual(set(result["packages"]), set(repair.FIRMWARE))
        self.assertEqual(result["targetKernel"], KERNEL)
        self.assertEqual(trusted.call_count, 2)

    def test_held_firmware_is_not_overridden(self):
        with mock.patch.object(repair, "healthy_dpkg", return_value={"firmware-mediatek"}), \
                mock.patch.object(repair, "trusted_candidate", return_value={"version": VERSION}), \
                self.assertRaisesRegex(repair.Stop, "held"):
            repair.make_plan(host(), False)

    def test_new_kernel_requires_owned_running_image_and_single_dependency(self):
        image = "linux-image-6.12.90+deb13-amd64"
        with mock.patch.object(repair, "healthy_dpkg", return_value=set()), \
                mock.patch.object(repair, "trusted_candidate", return_value={"version": "6.12.90-1"}), \
                mock.patch.object(repair, "run", return_value="Depends: " + image), \
                mock.patch.object(repair, "package_status", return_value=None), \
                self.assertRaisesRegex(repair.Stop, "not owned"):
            repair.make_plan(host(), True)
        for dependency in ("linux-image-amd64-unsigned", image + ", linux-image-6.12.91+deb13-amd64"):
            with self.subTest(dependency=dependency), \
                    mock.patch.object(repair, "healthy_dpkg", return_value=set()), \
                    mock.patch.object(repair, "trusted_candidate", return_value={"version": "6.12.90-1"}), \
                    mock.patch.object(repair, "run", return_value="Depends: " + dependency), \
                    self.assertRaisesRegex(repair.Stop, "one signed"):
                repair.make_plan(host(), True)

    def test_new_kernel_is_opt_in_and_added_only_when_newer(self):
        image = "linux-image-6.12.90+deb13-amd64"
        for newer in (False, True):
            with self.subTest(newer=newer), \
                    mock.patch.object(repair, "healthy_dpkg", return_value=set()), \
                    mock.patch.object(repair, "trusted_candidate", return_value={"version": "6.12.90-1"}), \
                    mock.patch.object(repair, "run", return_value="Depends: " + image), \
                    mock.patch.object(repair, "package_status", return_value="6.12.73-1"), \
                    mock.patch.object(repair, "version_lt", return_value=newer):
                result = repair.make_plan(host(), True)
            self.assertEqual(result["targetKernel"], image.removeprefix("linux-image-") if newer else KERNEL)
            self.assertEqual("linux-image-amd64" in result["packages"], newer)
            self.assertEqual(image in result["packages"], newer)


class SimulationTests(OfflineCase):
    def setUp(self):
        super().setUp()
        self.packages = {name: {"version": VERSION} for name in repair.FIRMWARE}

    def test_exact_installs_and_configuration_are_allowed(self):
        output = (f"Inst firmware-amd-graphics:amd64 [{VERSION}] ({VERSION} Debian:13/trixie [all])\n"
                  f"Inst firmware-mediatek ({VERSION} Debian:13/trixie [all])\n"
                  f"Conf firmware-amd-graphics ({VERSION} Debian:13/trixie [all])\n"
                  f"Conf firmware-mediatek ({VERSION} Debian:13/trixie [all])")
        self.assertEqual(len(repair.validate_simulation(output, self.packages)), 4)

    def test_unrelated_install_configuration_removal_and_purge_stop(self):
        for line in (f"Inst surprise-package ({VERSION} Debian:13/trixie [all])",
                     f"Conf surprise-package ({VERSION} Debian:13/trixie [all])",
                     "Remv firmware-amd-graphics [20240220-1]",
                     "Purg firmware-mediatek [20240220-1]",
                     f"Inst firmware-mediatek:arm64 ({VERSION} Debian:13/trixie [all])"):
            with self.subTest(line=line), self.assertRaisesRegex(repair.Stop, "unrelated"):
                repair.validate_simulation(line, self.packages)

    def test_unexpected_or_missing_install_version_stops(self):
        for line in ("Inst firmware-amd-graphics (20260410-1 Debian:13/trixie [all])",
                     "Inst firmware-amd-graphics"):
            with self.subTest(line=line), self.assertRaisesRegex(repair.Stop, "version"):
                repair.validate_simulation(line, self.packages)

    def test_unexpected_configuration_version_stops(self):
        with self.assertRaisesRegex(repair.Stop, "version"):
            repair.validate_simulation(
                "Conf firmware-amd-graphics (20260410-1 Debian:13/trixie [all])", self.packages)

    def test_empty_plan_stops(self):
        with self.assertRaisesRegex(repair.Stop, "no package actions"):
            repair.validate_simulation("0 upgraded, 0 newly installed.", self.packages)

    def test_apt_arguments_pin_versions_and_disallow_removal_and_insecure_repos(self):
        args = repair.apt_args({"packages": self.packages})
        for required in ("--no-remove", "--no-install-recommends", "--reinstall",
                         "APT::Get::AllowUnauthenticated=false", "Acquire::AllowInsecureRepositories=false"):
            self.assertIn(required, args)
        self.assertEqual(args[-2:], [p + "=" + VERSION for p in repair.FIRMWARE])
        self.assertFalse(set(args) & {"dist-upgrade", "full-upgrade", "autoremove", "--allow-downgrades"})


class FirmwareAndHostTests(OfflineCase):
    def test_exact_hardware_firmware_paths(self):
        self.assertEqual(tuple(repair.FILES), FIRMWARE_FILES)

    def test_disk_firmware_accepts_compression_and_reports_one_missing(self):
        missing = FIRMWARE_FILES[-1]
        paths = {str(Path("/usr/lib/firmware") / (p + (".xz" if i % 2 else ".zst")))
                 for i, p in enumerate(FIRMWARE_FILES) if p != missing}
        with mock.patch.object(Path, "is_file", lambda p: str(p) in paths):
            result = repair.disk_firmware()
        self.assertEqual({p for p, exists in result.items() if not exists}, {missing})

    def test_initrd_requires_exact_path_not_similar_basename(self):
        lines = ["usr/lib/firmware/" + p + ".zst" for p in FIRMWARE_FILES]
        lines[-1] += ".wrong"
        with mock.patch.object(Path, "is_file", return_value=True), \
                mock.patch.object(repair, "run", return_value="\n".join(lines)) as run:
            result = repair.initrd_firmware(KERNEL)
        self.assertTrue(result["present"])
        self.assertFalse(result["files"][FIRMWARE_FILES[-1]])
        self.assertTrue(all(result["files"][p] for p in FIRMWARE_FILES[:-1]))
        self.assertEqual(run.call_args.args[0], ["lsinitramfs", "/boot/initrd.img-" + KERNEL])

    def test_missing_initrd_does_not_execute_lsinitramfs(self):
        with mock.patch.object(Path, "is_file", return_value=False), mock.patch.object(repair, "run") as run:
            self.assertEqual(repair.initrd_firmware(KERNEL),
                             {"present": False, "files": {}, "requiredFiles": []})
        run.assert_not_called()

    def test_initrd_only_requires_firmware_for_embedded_drivers(self):
        for modules, expected in (
            (["amdgpu"], FIRMWARE_FILES[:5]),
            (["mt7921e"], FIRMWARE_FILES[5:7]),
            (["mt7921_common"], FIRMWARE_FILES[5:7]),
            (["btmtk"], FIRMWARE_FILES[7:]),
            (["amdgpu", "mt7921e", "btmtk"], FIRMWARE_FILES),
            (["nvme"], ()),
        ):
            lines = ["usr/lib/modules/synthetic/kernel/" + module + ".ko.zst" for module in modules]
            lines += ["usr/lib/firmware/" + path + ".xz" for path in expected]
            with self.subTest(modules=modules), mock.patch.object(Path, "is_file", return_value=True), \
                    mock.patch.object(repair, "run", return_value="\n".join(lines)):
                image = repair.initrd_firmware(KERNEL)
                self.assertEqual(set(image["requiredFiles"]), set(expected))
                self.assertTrue(repair.initrd_ready(image))

    def test_embedded_driver_missing_firmware_fails_readiness(self):
        lines = ["usr/lib/modules/synthetic/kernel/amdgpu.ko.xz"]
        lines += ["lib/firmware/" + path for path in FIRMWARE_FILES[1:5]]
        with mock.patch.object(Path, "is_file", return_value=True), \
                mock.patch.object(repair, "run", return_value="\n".join(lines)):
            image = repair.initrd_firmware(KERNEL)
        self.assertFalse(repair.initrd_ready(image))

    def test_empty_initrd_listing_stops_instead_of_implying_no_required_drivers(self):
        with mock.patch.object(Path, "is_file", return_value=True), \
                mock.patch.object(repair, "run", return_value=""), self.assertRaises(repair.Stop):
            repair.initrd_firmware(KERNEL)

    def test_incomplete_or_unknown_initrd_metadata_is_not_ready(self):
        healthy = snapshot()["runningInitramfs"]
        cases = [dict(healthy, present=False), dict(healthy, files={}),
                 dict(healthy, requiredFiles=["unknown.bin"])]
        missing = dict(healthy)
        missing.pop("requiredFiles")
        cases.append(missing)
        for image in cases:
            with self.subTest(image=image):
                self.assertFalse(repair.initrd_ready(image))

    def test_gpu_readiness_requires_amd_vendor_and_amdgpu_bound_card(self):
        card = Path("/sys/class/drm/card0")
        for vendor, driver, ready in (("0x1002", "amdgpu", True),
                                      ("0x1002", "simpledrm", False),
                                      ("0x8086", "amdgpu", False)):
            with self.subTest(vendor=vendor, driver=driver), \
                    mock.patch.object(Path, "glob", return_value=[card]), \
                    mock.patch.object(repair, "read", return_value=vendor), \
                    mock.patch.object(Path, "resolve", return_value=Path("/drivers") / driver):
                self.assertEqual(repair.gpu_initialized(), ready)

    def test_gpu_connector_without_card_is_not_gpu_readiness(self):
        with mock.patch.object(Path, "glob", return_value=[Path("/sys/class/drm/card0-HDMI-A-1")]), \
                mock.patch.object(repair, "read") as read:
            self.assertFalse(repair.gpu_initialized())
        read.assert_not_called()

    def test_host_gate_accepts_only_intended_os_architecture_hardware_kernel(self):
        repair.validate_host(host())
        for field, value in (("id", "ubuntu"), ("version", "12"), ("architecture", "arm64"),
                             ("vendor", "Other"), ("model", "NucBox M7"), ("kernel", "custom/kernel")):
            info = host()
            info[field] = value
            with self.subTest(field=field), self.assertRaises(repair.Stop):
                repair.validate_host(info)

    def test_boot_faults_are_counted_but_routine_mining_message_is_not(self):
        lines = ["BUG: kernel NULL pointer dereference", "rcu: INFO: detected stalls on CPUs/tasks:",
                 "Out of memory: Killed process 123", "amdgpu: Fatal error during GPU init",
                 "Direct firmware load for amdgpu/yellow_carp_toc.bin failed with error -2",
                 "Direct firmware load for mediatek/WIFI_MT7922_patch_mcu_1_1_hdr.bin failed with error -2",
                 "Imported mempool: 0 failed"]
        with mock.patch.object(repair, "run", return_value="\n".join(lines)):
            result = repair.boot_findings()
        self.assertEqual(result["kernelFaultLines"], 3)
        self.assertEqual(result["firmwareFailureLines"], 3)
        self.assertFalse(result["journalMayBeCapped"])


class VerificationTests(OfflineCase):
    def call_verify(self, report=None, saved_state=None, info=None):
        report = snapshot() if report is None else report
        saved_state = state() if saved_state is None else saved_state
        with mock.patch.object(repair, "save") as save, contextlib.redirect_stdout(io.StringIO()):
            repair.verify(host() if info is None else info, saved_state, report)
        return report, save

    def test_healthy_new_boot_passes_without_claiming_freeze_cure(self):
        result, save = self.call_verify()
        self.assertEqual(result["result"], "BOOT_CHECK_PASSED")
        self.assertIs(result["freezeFixProven"], False)
        self.assertEqual(result["repair"]["status"], "verified")
        save.assert_called_once()

    def test_same_boot_waits_without_reinstall_or_marking_verified(self):
        info = host()
        info["bootId"] = "old-boot"
        result, save = self.call_verify(info=info)
        self.assertEqual(result["result"], "REBOOT_REQUIRED")
        self.assertEqual(result["repair"]["status"], "awaiting-reboot")
        save.assert_not_called()

    def test_incomplete_state_requires_support_even_after_reboot(self):
        for status in ("installing", "incomplete"):
            with self.subTest(status=status):
                result, save = self.call_verify(saved_state=state(status))
                self.assertEqual(result["result"], "SUPPORT_REVIEW_REQUIRED")
                save.assert_not_called()

    def test_fault_firmware_failure_wrong_kernel_or_missing_file_fail_verification(self):
        for failure in ("kernel-fault", "firmware-failure", "wrong-kernel", "disk-file", "initrd-file"):
            report, info = snapshot(), host()
            if failure == "kernel-fault":
                report["currentBoot"]["kernelFaultLines"] = 1
            elif failure == "firmware-failure":
                report["currentBoot"]["firmwareFailureLines"] = 1
            elif failure == "wrong-kernel":
                info["kernel"] = "6.12.70+deb13-amd64"
            elif failure == "disk-file":
                report["firmwareOnDisk"][FIRMWARE_FILES[0]] = False
            else:
                report["runningInitramfs"]["files"][FIRMWARE_FILES[0]] = False
            with self.subTest(failure=failure):
                result, save = self.call_verify(report=report, info=info)
                self.assertEqual(result["result"], "SUPPORT_REVIEW_REQUIRED")
                save.assert_not_called()

    def test_missing_initramfs_never_passes_vacuous_all(self):
        report = snapshot()
        report["runningInitramfs"] = {"present": False, "files": {}}
        result, save = self.call_verify(report=report)
        self.assertEqual(result["result"], "SUPPORT_REVIEW_REQUIRED")
        save.assert_not_called()

    def test_incomplete_firmware_inventory_never_passes_vacuous_all(self):
        for key in ("firmwareOnDisk", "runningInitramfs"):
            report = snapshot()
            if key == "firmwareOnDisk":
                report[key] = {}
            else:
                report[key]["files"] = {}
            with self.subTest(key=key):
                result, save = self.call_verify(report=report)
                self.assertEqual(result["result"], "SUPPORT_REVIEW_REQUIRED")
                save.assert_not_called()

    def test_capped_journal_does_not_certify_fault_free_boot(self):
        report = snapshot()
        report["currentBoot"]["journalMayBeCapped"] = True
        result, save = self.call_verify(report=report)
        self.assertEqual(result["result"], "SUPPORT_REVIEW_REQUIRED")
        save.assert_not_called()

    def test_uninitialized_gpu_does_not_pass_even_with_firmware_present(self):
        for status in (False, None):
            report = snapshot()
            report["amdGpuInitialized"] = status
            with self.subTest(status=status):
                result, save = self.call_verify(report=report)
                self.assertEqual(result["result"], "SUPPORT_REVIEW_REQUIRED")
                save.assert_not_called()

    def test_optional_late_driver_firmware_can_be_absent_from_initrd(self):
        report = snapshot()
        report["runningInitramfs"]["requiredFiles"] = list(FIRMWARE_FILES[:5])
        for path in FIRMWARE_FILES[5:]:
            report["runningInitramfs"]["files"][path] = False
        result, _ = self.call_verify(report=report)
        self.assertEqual(result["result"], "BOOT_CHECK_PASSED")

    def test_previously_verified_repair_still_checks_new_faults(self):
        report = snapshot()
        report["currentBoot"]["kernelFaultLines"] = 1
        result, save = self.call_verify(report=report, saved_state=state("verified"))
        self.assertEqual(result["result"], "SUPPORT_REVIEW_REQUIRED")
        save.assert_not_called()


class MainIdempotencyTests(OfflineCase):
    def main_with_state(self, saved_state, info=None):
        saved_state = copy.deepcopy(saved_state)
        fake_state = mock.MagicMock()
        fake_state.exists.return_value = True
        fake_state.read_text.return_value = json.dumps(saved_state)
        with contextlib.ExitStack() as stack:
            for target, value in (("system_info", host() if info is None else info),
                                  ("snapshot", snapshot())):
                stack.enter_context(mock.patch.object(repair, target, return_value=value))
            for target in ("make_plan", "simulate", "backup", "healthy_dpkg", "run"):
                stack.enter_context(mock.patch.object(repair, target,
                    side_effect=AssertionError("pending repair must not repeat " + target)))
            stack.enter_context(mock.patch.object(repair, "STATE", fake_state))
            stack.enter_context(mock.patch.object(repair.platform, "system", return_value="Linux"))
            stack.enter_context(mock.patch.object(repair.os, "geteuid", return_value=0))
            stack.enter_context(mock.patch.object(repair.os, "umask"))
            stack.enter_context(mock.patch.object(repair.os, "chown"))
            stack.enter_context(mock.patch.object(repair.os, "open", return_value=91))
            stack.enter_context(mock.patch.object(repair.os, "fdopen", return_value=mock.MagicMock()))
            stack.enter_context(mock.patch.object(repair.fcntl, "flock"))
            stack.enter_context(mock.patch("builtins.open", mock.mock_open()))
            save = stack.enter_context(mock.patch.object(repair, "save"))
            stack.enter_context(contextlib.redirect_stdout(io.StringIO()))
            result = repair.main(["--repair", "--update-kernel"])
        return result, save

    def test_rerunning_repair_before_reboot_performs_no_apt_or_backup(self):
        info = host()
        info["bootId"] = "old-boot"
        result, save = self.main_with_state(state(), info)
        self.assertEqual(result, 0)
        self.assertEqual(save.call_args.args[1]["result"], "REBOOT_REQUIRED")

    def test_rerunning_repair_after_reboot_verifies_without_reinstall(self):
        result, save = self.main_with_state(state())
        self.assertEqual(result, 0)
        self.assertEqual(save.call_args.args[1]["result"], "BOOT_CHECK_PASSED")

    def test_incomplete_repair_cannot_be_silently_reapplied(self):
        result, save = self.main_with_state(state("incomplete"))
        self.assertEqual(result, 2)
        self.assertEqual(save.call_args.args[1]["result"], "SUPPORT_REVIEW_REQUIRED")


class FinalSafetyTests(OfflineCase):
    def test_missing_journal_or_boot_start_never_passes(self):
        for text in ("", "-- No entries --\n", "amdgpu ready\n"):
            with self.subTest(text=text), mock.patch.object(repair, "run", return_value=text):
                report = snapshot()
                report["currentBoot"] = repair.boot_findings()
                with mock.patch.object(repair, "save") as save, contextlib.redirect_stdout(io.StringIO()):
                    repair.verify(host(), state(), report)
                self.assertEqual(report["result"], "SUPPORT_REVIEW_REQUIRED")
                save.assert_not_called()

    def test_report_write_does_not_follow_predictable_temporary_symlink(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            victim = root / "keep.txt"
            victim.write_text("unchanged")
            report = root / "report.json"
            (root / "report.json.tmp").symlink_to(victim)
            repair.save(report, {"safe": True})
            self.assertEqual(victim.read_text(), "unchanged")
            self.assertEqual(json.loads(report.read_text()), {"safe": True})

    def test_sudo_advice_preserves_requested_scope(self):
        for flags in ([], ["--check"], ["--repair"], ["--repair", "--update-kernel"]):
            output = io.StringIO()
            with mock.patch.object(repair.platform, "system", return_value="Linux"), \
                    mock.patch.object(repair.os, "geteuid", return_value=1000), \
                    contextlib.redirect_stdout(output):
                self.assertEqual(repair.main(flags), 2)
            self.assertEqual("--update-kernel" in output.getvalue(), "--update-kernel" in flags)
            self.assertEqual("--repair" in output.getvalue(), "--repair" in flags)

    def test_custom_or_pending_boot_selection_is_not_overwritten(self):
        for default, env, allowed in (("GRUB_DEFAULT=0", "", True),
                                      ('GRUB_DEFAULT="0"', "", True),
                                      ("GRUB_DEFAULT=saved", "", False),
                                      ("GRUB_DEFAULT=1", "", False),
                                      ("GRUB_DEFAULT=0", "next_entry=other\n", False)):
            with self.subTest(default=default, env=env), \
                    mock.patch.object(repair.MENU_CONFIG.__class__, "exists", return_value=False), \
                    mock.patch.object(Path, "glob", return_value=[]), \
                    mock.patch.object(repair, "read", return_value=default), \
                    mock.patch.object(repair.shutil, "which", return_value="/usr/bin/grub-editenv"), \
                    mock.patch.object(repair, "run", return_value=env):
                if allowed:
                    repair.check_boot_selection()
                else:
                    with self.assertRaises(repair.Stop):
                        repair.check_boot_selection()


if __name__ == "__main__":
    unittest.main()
