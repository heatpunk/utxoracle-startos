import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.9.6:10',
  releaseNotes: {
    en_US: `Local hourly price API test build.

The original price calculation is unchanged. /price returns only the formatted USD amount. /price.json includes block provenance and timestamps; /history.json exposes up to 24 real hourly observations.

History and the original chart survive restart and are included in backups. Failed, stale or unsynced data is not reported as a current price. No external price feed, hosted Bitcoin RPC or VPS is used.

This is an independent test package, not an official upstream release. Real-device installation and upgrade tests are pending. The original license and its API restrictions remain unchanged.`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
