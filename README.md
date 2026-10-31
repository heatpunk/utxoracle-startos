# Hourly local UTXOracle API for StartOS

Independent test packaging for [heatpunk/UTXOracle](https://github.com/heatpunk/UTXOracle),
based on [Start9-Community's wrapper](https://github.com/Start9-Community/utxoracle-startos).
The reference price algorithm and block selection are unchanged. This is not an
official release or a claim of permission under the author's custom license.

## Local endpoints

Use the same StartOS origin as the Web UI:

- `/price`: only the formatted whole-dollar USD price, such as `$123 456`.
- `/price.json`: numeric amount, timestamps, output name and input block provenance.
- `/history.json`: up to 24 actual hourly samples from the last 24 hours.
- `/health`: 200 for a usable result; 503 for unavailable or stale results.
- `/`: the original chart, refreshed by the same hourly calculation.

The Price API and Price History interfaces show their complete URLs in StartOS.
No RPC credential, wallet data, source directory or arbitrary files are exposed.
There is no API authentication. Keep the interface local; do not publish it as
an Internet service. Cross-origin read-only requests are supported for local
widgets. Browser certificate and private-network policies may still apply.

## Runtime and data

The application is a pinned `upstream` git submodule, not a modified copy of the
source in this wrapper. `Dockerfile` copies the two standard-library Python
runtime files into a `python:3.11-slim` container. `docker_entrypoint.sh` writes an
ephemeral `bitcoin.conf`, then execs `UTXOracle.py --serve`. There is one Python
HTTP process and at most one calculation child; no separate static web server,
cron service, exchange API, VPS, or external RPC is involved.

StartOS supplies Bitcoin's bridge address using the existing imported host and
port IDs. Bitcoin's `main` volume is mounted read-only at `/mnt/bitcoind`, solely
for the current `.cookie`; it is read in place on every RPC request. The wrapper
never copies it or publishes it. An unresolved address is not replaced with a
fallback node.

`main` is the new writable volume, mounted at `/data`. It contains only:

- `state.json`: the last attempted hour and up to 24 successful hourly observations.
- `index.html`: the original chart from the last completed calculation.

The existing `startos` volume keeps `store.json`, the Configure selection. Both
volumes are included in backups. Version `0.9.6:10` is newer than the published
`0.9.6:9`; the earlier migration retiring the old `main` host is retained in the
version graph. Existing Configure settings are not reset. Actual upgrade and
backup/restore behavior still require real-device testing.

## Timing and honesty

First installation computes immediately. Each subsequent attempt starts at the
top of a UTC hour, independently of HTTP requests. Computation can take several
minutes. A same-hour restart does not create a second sample. Failed attempts,
interrupted attempts and offline hours remain gaps. It takes a day of successful
operation to accumulate a full 24-point history; no invented data is preloaded.

The default is the reference recent-block mode. At node height H it processes
H-144 through H-1, exactly like the source script. It is not a new one-hour
transaction window or a new six-confirmation rule. The Configure action retains
Yesterday and Specific Date; changing mode starts a separate history rather than
mixing different price definitions.

Price endpoints return 503 after a failed update or when an observation is two
hours old. Recent-block mode also treats a newest input block two hours old as
stale. Historical modes do not confuse the age of the requested day's blocks
with the freshness of the calculation. The last real JSON observation remains
available as `stale: true`; the raw endpoint never returns an old-looking price
with a success status. The chart visibly labels stale data. `/health` drives the
StartOS Completion health check rather than an old one-shot exit-code file.

The calculation refuses to export from a node in initial block download. The
original chart's external YouTube embed is removed before serving it; CSP blocks
other external resources. The normal reference invocation remains unchanged.

## Build and verification

```sh
git clone --recurse-submodules --branch feat/hourly-local-api https://github.com/heatpunk/utxoracle-startos.git
cd utxoracle-startos
npm ci
python3 -m unittest discover -s tests -v
python3 -m unittest discover -s upstream/tests -v
make
```

Use a StartOS packaging workspace and the official build tools described at
<https://docs.start9.com/packaging>. SDK is pinned to `3.0.3`; native x86_64 and
aarch64 builds run in the inherited Start9 build-only workflow. The independent
fork does not run Start9's registry publishing jobs or require their secrets.

The ordinary tests use explicitly synthetic prices. A separate recorded-mainnet
replay compares the original reference chart with the fork's JSON/plain outputs.
Build, replay and container tests are not a claim of installation on Marcus's
StartOS. Release notes identify the actual CI commit and pending device tests.

## License

`LICENSE` is retained unchanged. It is the author's custom UTXOracle license,
not the Blue Oak license originally claimed by the upstream README. Its API,
name and commercial-use restrictions need author clarification. This package
does not grant additional rights, claim approval or publish a live price service.
See the app's [API documentation](https://github.com/heatpunk/UTXOracle/blob/feat/hourly-local-api/API.md).
