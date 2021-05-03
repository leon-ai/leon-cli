#!/usr/bin/env node
import chalk from 'chalk'
import { Cli } from 'clipanion'

import { cli } from './cli'

const [, , ...args] = process.argv

cli.runExit(args, Cli.defaultContext).catch(() => {
  console.error(chalk.red('Error occurred...'))
  process.exit(1)
})
