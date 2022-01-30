#!/usr/bin/env node
import chalk from 'chalk'
import { Cli } from 'clipanion'
import updateNotifier from 'update-notifier'

import { cli } from './cli.js'
import { packageJSON } from './packageJSON.js'

const [, , ...args] = process.argv

const notifier = updateNotifier({
  pkg: packageJSON
})
notifier.notify({ isGlobal: true })

cli.runExit(args, Cli.defaultContext).catch(() => {
  console.error(chalk.red('Error occurred...'))
  process.exit(1)
})
