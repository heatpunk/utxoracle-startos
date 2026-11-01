# UTXOracle: hourly local price API

This independent test build uses your Bitcoin node on this StartOS server.
It does not contact exchanges or hosted price providers and does not require a VPS.
The original UTXOracle price calculation is unchanged.

## Start

Keep Bitcoin fully synchronized. Start UTXOracle and leave Configure set to
**Today** for the rolling recent-block estimate. First calculation can take
several minutes; then it updates once each UTC hour.

The **Web UI** interface still displays the original chart. The **Price API**
interface gives you the exact URL that returns only a value such as `$123 456`.

Use the API URL as your panel's source. No image parsing or HTML scraping is
needed. `/price.json` also returns a numeric price, timestamps and input block
information. Prices are USD per BTC.

## Hourly update and errors

The price is recomputed at the top of each UTC hour from your own node and each
new observation replaces the previous one. Nothing is invented for hours that
never ran. The last real observation survives restart and is included in the
service backup.

Before the first calculation, after a failed update, or if data is too old,
`/price` responds with HTTP 503 instead of pretending that an old price is current.
`/price.json` keeps the last real result and labels it `stale: true`. The
Completion health check tracks this condition. Read the service logs if it fails.
The next scheduled attempt is the next UTC hour.

Configure also retains **Yesterday** and **Specific Date** for the original
historical modes. Changing the mode recomputes under the chosen price
definition. Historical dates require locally available blocks.

## Test-package scope

This package targets StartOS 0.4.0.2 or newer and keeps the service ID `utxoracle`.
Back up the existing service before testing an upgrade. Both x86_64 and aarch64
packages are provided; use the one matching your server. This package is not
compatible with StartOS 0.3.5.

Build and container tests do not establish real-device upgrade or restore safety.
A StartOS device test is still required. Keep the API local; it has no login and
must not be port-forwarded as a public live-price service.

The original custom license is retained, including its API and naming
restrictions. This is not an official Steve/UTXOracle release or a statement that
those restrictions have been resolved.
