FROM python:3.11-slim

WORKDIR /app

# Pinned upstream submodule. No source patches are made by this wrapper.
COPY upstream/UTXOracle.py /app/UTXOracle.py
COPY upstream/utxoracle_api.py /app/utxoracle_api.py
COPY docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
RUN chmod +x /usr/local/bin/docker_entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/usr/local/bin/docker_entrypoint.sh"]
