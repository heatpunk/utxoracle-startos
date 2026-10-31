import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'utxoracle',
  title: 'UTXOracle',
  license: 'UTXOracle License 1.0',
  packageRepo: 'https://github.com/heatpunk/utxoracle-startos',
  upstreamRepo: 'https://github.com/heatpunk/UTXOracle',
  marketingUrl: 'https://utxo.live/',
  donationUrl:
    'https://primal.net/p/nprofile1qqsd39l0ekt3lrj74cyvs6ma5ehcnvcwwcdy4p4vg8vswsjazkmrplspa5mvm',
  description: { short, long },
  volumes: ['startos', 'main'],
  images: {
    main: {
      source: { dockerBuild: {} },
      arch: ['x86_64', 'aarch64'],
      emulateMissing: false,
    },
  },
})
