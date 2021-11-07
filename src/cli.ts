import path from 'node:path'

import { Builtins, Cli } from 'clipanion'
import readPackage from 'read-pkg'

import { CreateBirthCommand } from './commands/create/birth'
import { StartCommand } from './commands/start'
import { CheckCommand } from './commands/check'
import { Leon } from './services/Leon'

export const cli = new Cli({
  binaryLabel: Leon.NAME,
  binaryName: Leon.NAME,
  binaryVersion: readPackage.sync({ cwd: path.join(__dirname, '..') }).version
})
cli.register(Builtins.HelpCommand)
cli.register(Builtins.VersionCommand)
cli.register(CreateBirthCommand)
cli.register(StartCommand)
cli.register(CheckCommand)
