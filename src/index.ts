#!/usr/bin/env node
import { Cli } from 'clipanion'
import updateNotifier from 'update-notifier'

import { cli } from '#src/cli.js'
import { packageJSON } from '#src/packageJSON.js'

const [, , ...arguments_] = process.argv

const notifier = updateNotifier({
  pkg: packageJSON
})
notifier.notify({ isGlobal: true })

await cli.runExit(arguments_, Cli.defaultContext)
