import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v0969 } from './v0.9.6_9'

export const versionGraph = VersionGraph.of({
  current,
  other: [v0969],
})
