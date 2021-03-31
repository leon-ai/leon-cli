#!/usr/bin/env node
const chalk = require('chalk')
const { Builtins, Cli } = require('clipanion')

const packageJSON = require('./package.json')
const CreateBirthCommand = require('./commands/create/birth')

const [, , ...args] = process.argv

async function main () {
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
