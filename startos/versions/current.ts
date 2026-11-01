import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.9.6:11',
  releaseNotes: {
    en_US: `Local hourly price API test build.

The original price calculation is unchanged. /price returns only the formatted USD amount, recomputed at the top of each UTC hour. /price.json adds block provenance and timestamps.

The original chart survives restart and is included in backups. Failed, stale or unsynced data is not reported as a current price. No external price feed, hosted Bitcoin RPC or VPS is used.

This is an independent test package, not an official upstream release. Real-device installation and upgrade tests are pending. The original license and its API restrictions remain unchanged.`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
