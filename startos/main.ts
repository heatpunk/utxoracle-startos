import { T } from '@start9labs/start-sdk'
import { rpcHostId, rpcPort } from 'bitcoin-core-startos/startos/utils'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { bitcoinMountpoint, uiPort } from './utils'

type BitcoinCoreManifest = T.SDKManifest & {
  id: 'bitcoind'
  volumes: ['main']
}

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting UTXOracle'))

  // The run mode (set by the Configure action); re-run when it changes.
  const mode = (await storeJson.read((s) => s.mode).const(effects)) || 'rb'

  // Bitcoin's JSON-RPC address over the internal bridge, or null while the
  // dependency is absent/unresolved. The bridge address only changes when
  // Bitcoin's binding does, so this .const() heals main on Bitcoin
  // install/uninstall/port-change and never restarts on its updates or cookie
  // rotations. While it's null we omit RPC_HOST/RPC_PORT and let the entrypoint
  // wait; the .const() re-runs main with the real address once Bitcoin resolves.
  const rpcAddress = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'bitcoind',
      hostId: rpcHostId,
      internalPort: rpcPort,
      ssl: false,
    })
    .const()
  const [rpcHost, rpcPortExternal] = rpcAddress?.split(':') ?? []

  // Keep observed hourly history across restarts; never copy Bitcoin's cookie.
  const mounts = sdk.Mounts.of()
    .mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    })
    .mountDependency<BitcoinCoreManifest>({
      dependencyId: 'bitcoind',
      volumeId: 'main',
      subpath: null,
      mountpoint: bitcoinMountpoint,
      readonly: true,
    })

  const subcontainer = sdk.SubContainer.of(
    effects,
    { imageId: 'main' },
    mounts,
    'utxoracle-sub',
  )

  return sdk.Daemons.of(effects)
    .addDaemon('primary', {
      subcontainer,
      exec: {
        command: sdk.useEntrypoint(),
        env: {
          UTXORACLE_MODE: mode,
          ...(rpcAddress
            ? { RPC_HOST: rpcHost, RPC_PORT: rpcPortExternal }
            : {}),
        },
        runAsInit: true,
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('The web interface is ready'),
            errorMessage: i18n('The web interface is not ready'),
          }),
        gracePeriod: 30_000,
      },
      requires: [],
    })
    .addHealthCheck('complete', {
      ready: {
        display: i18n('UTXOracle Completion'),
        fn: async () => {
          const res = await subcontainer.exec(
            [
              'python3',
              '-c',
              "import urllib.request; urllib.request.urlopen('http://127.0.0.1/health', timeout=5).read()",
            ],
            { timeout: 10_000 },
          )
          if (res.exitCode === 0) {
            return {
              result: 'success',
              message: i18n('UTXOracle completed successfully'),
            }
          }
          const state = await subcontainer.exec(
            [
              'python3',
              '-c',
              "import json,pathlib; p=pathlib.Path('/data/state.json'); s=json.loads(p.read_text()) if p.exists() else {}; print('failed' if s.get('error') or s.get('samples') else 'loading')",
            ],
            { timeout: 10_000 },
          )
          return String(state.stdout).trim() === 'loading'
            ? { result: 'loading', message: i18n('UTXOracle is still running') }
            : {
                result: 'failure',
                message: i18n('UTXOracle exited with an error'),
              }
        },
        trigger: sdk.trigger.statusTrigger(30_000, {
          starting: 5_000,
          loading: 30_000,
          failure: 30_000,
        }),
      },
      requires: ['primary'],
    })
})
