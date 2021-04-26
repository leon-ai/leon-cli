import { Builtins, Cli } from 'clipanion'

import { CreateBirthCommand } from './commands/create/birth'
import { StartCommand } from './commands/start'
import { Leon } from './services/Leon'

export const cli = new Cli({
  binaryLabel: Leon.NAME,
  binaryName: Leon.NAME,
  binaryVersion: '0.0.0'
})
cli.register(Builtins.HelpCommand)
cli.register(Builtins.VersionCommand)
cli.register(CreateBirthCommand)
cli.register(StartCommand)
