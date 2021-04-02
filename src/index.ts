#!/usr/bin/env node
import chalk from 'chalk'
import { Builtins, Cli } from 'clipanion'

import { CreateBirthCommand } from './commands/create/birth'
import { getPackageJSON } from './utils/getPackageJSON'

const [, , ...args] = process.argv

async function main() {
  const packageJSON = await getPackageJSON()
  const cli = new Cli({
    binaryLabel: 'leon',
    binaryName: 'leon',
    binaryVersion: packageJSON.version
  })
  cli.register(CreateBirthCommand)
  cli.register(Builtins.HelpCommand)
  cli.register(Builtins.VersionCommand)
  await cli.runExit(args, Cli.defaultContext)
}

main().catch(() => {
  console.error(chalk.red('Error occurred...'))
  process.exit(1)
})
