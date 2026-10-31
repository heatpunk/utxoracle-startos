#!/bin/sh
# StartOS supplies only the local Bitcoin connection and persistent data mount.
set -eu

DATADIR="${UTXORACLE_DATADIR:-/app/datadir}"
STATE_DIR="${UTXORACLE_STATE_DIR:-/data}"
COOKIE="${UTXORACLE_COOKIE:-/mnt/bitcoind/.cookie}"

# StartOS reruns main when the local dependency address becomes available.
if [ -z "${RPC_HOST:-}" ] || [ -z "${RPC_PORT:-}" ]; then
    printf '%s\n' 'Waiting for StartOS to resolve the local Bitcoin RPC address.'
    while :; do sleep 10; done
fi

mkdir -p "$DATADIR" "$STATE_DIR"
umask 077
printf 'rpcconnect=%s\nrpcport=%s\nrpccookiefile=%s\n' \
    "$RPC_HOST" "$RPC_PORT" "$COOKIE" > "$DATADIR/bitcoin.conf"

exec python3 /app/UTXOracle.py --serve \
    -p "$DATADIR" --host 0.0.0.0 --port 80 \
    --state-dir "$STATE_DIR" --mode "${UTXORACLE_MODE:-rb}" \
    --chart "$STATE_DIR/index.html"
