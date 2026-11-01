"""Packaging checks: run before changing the wrapper."""

from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class PackagingTests(unittest.TestCase):
    def test_entrypoint_starts_the_upstream_hourly_api_on_the_existing_web_port(self):
        text = (ROOT / "docker_entrypoint.sh").read_text()
        self.assertIn("UTXOracle.py --serve", text)
        self.assertIn("--port 80", text)
        self.assertIn("--state-dir", text)
        self.assertIn("exec python3", text)
        self.assertNotIn("python3 -m http.server", text)

    def test_hourly_state_volume_is_mounted_and_backed_up(self):
        main = (ROOT / "startos/main.ts").read_text()
        manifest = (ROOT / "startos/manifest/index.ts").read_text()
        backup = (ROOT / "startos/backups.ts").read_text()
        app_volume = main[main.index("mountVolume({") : main.index("mountDependency")]
        self.assertIn("volumeId: 'main'", app_volume)
        self.assertIn("mountpoint: '/data'", app_volume)
        self.assertIn("readonly: false", app_volume)
        self.assertIn("readonly: true", main[main.index("mountDependency") :])
        self.assertIn("'main'", manifest)
        self.assertIn("'main'", backup)
        self.assertIn("'startos'", backup)

    def test_previous_version_keeps_its_legacy_host_migration(self):
        graph = (ROOT / "startos/versions/index.ts").read_text()
        previous = (ROOT / "startos/versions/v0.9.6_9.ts").read_text()
        self.assertIn("v0969", graph)
        self.assertIn("version: '0.9.6:9'", previous)
        self.assertIn("MultiHost.of(effects, 'main').retire()", previous)

    def test_price_endpoint_is_visible_as_a_startos_api_interface(self):
        text = (ROOT / "startos/interfaces.ts").read_text()
        self.assertIn("type: 'api'", text)
        self.assertIn("path: '/price'", text)

    def test_original_price_source_is_not_vendored_or_patched_in_the_wrapper(self):
        docker = (ROOT / "Dockerfile").read_text()
        self.assertFalse((ROOT / "utxoracle.py").exists())
        self.assertIn("COPY upstream/UTXOracle.py", docker)
        self.assertIn("COPY upstream/utxoracle_api.py", docker)


if __name__ == '__main__':
    unittest.main()
