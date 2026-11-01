# Updating the hourly API package

The `upstream` git submodule pins a verified commit of
<https://github.com/heatpunk/UTXOracle>. It descends from
`Unbesteveable/UTXOracle` and keeps the original calculation and block selection.
Do not edit the submodule source in this wrapper or download a moving script
into the image during a build.

Make app changes in the application fork, test them, and push that commit first.
Update the submodule to that exact commit, run the wrapper and app tests,
typecheck and format `startos/`, then build both architectures through GitHub CI.
Inspect the produced package version, architecture, migration ranges, source
commit and embedded runtime before publishing a test release.

Keep the package ID `utxoracle`. Advance the packaging revision beyond the
published package instead of resetting version ordering. Version `0.9.6:9`
retired a legacy host and its migration stays in `v0.9.6_9.ts`; do not move that
operation into the newest migration or delete its graph entry.

The `main` volume holds the last hourly observation and the last chart. The existing
`startos` volume holds Configure settings. Include both in backup. Never copy or
expose the Bitcoin cookie from its read-only dependency mount.

Registry release workflows are gated to Start9-Community. Build-only workflows
in this fork use temporary test signing identities and publish no registry entry.
A test prerelease must point at CI-produced files from the exact verified head.
A successful build is not a real-device installation, upgrade or restore test.

The original `LICENSE` remains unchanged. App-source availability does not
resolve its API, naming, or commercial restrictions.
