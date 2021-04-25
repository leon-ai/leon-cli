import { Builtins, Cli } from 'clipanion'

import { CreateBirthCommand } from './commands/create/birth'
import { Leon } from './services/Leon'

export const cli = new Cli({
  binaryLabel: Leon.NAME,
  binaryName: Leon.NAME,
  binaryVersion: '0.0.0'
})
cli.register(Builtins.HelpCommand)
cli.register(Builtins.VersionCommand)
cli.register(CreateBirthCommand)
