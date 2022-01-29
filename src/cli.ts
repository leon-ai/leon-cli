import path from 'node:path'

import { Builtins, Cli } from 'clipanion'
import readPackage from 'read-pkg'

import { CreateBirthCommand } from './commands/create/birth.js'
import { CheckCommand } from './commands/check.js'
import { HelpCommand } from './commands/help.js'
import { StartCommand } from './commands/start.js'
import { Leon } from './services/Leon.js'

export const cli = new Cli({
  binaryLabel: Leon.NAME,
  binaryName: Leon.NAME,
  binaryVersion: readPackage.sync({ cwd: path.join(__dirname, '..') }).version
})
cli.register(Builtins.HelpCommand)
cli.register(Builtins.VersionCommand)
cli.register(CreateBirthCommand)
cli.register(CheckCommand)
cli.register(HelpCommand)
cli.register(StartCommand)
