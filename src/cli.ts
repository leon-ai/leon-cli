import { Builtins, Cli } from 'clipanion'
import { readPackageSync } from 'read-pkg'

import { CreateBirthCommand } from './commands/create/birth'
import { StartCommand } from './commands/start'
import { CheckCommand } from './commands/check'
import { Leon } from './services/Leon'

export const cli = new Cli({
  binaryLabel: Leon.NAME,
  binaryName: Leon.NAME,
  binaryVersion: readPackageSync().version
})
cli.register(Builtins.HelpCommand)
cli.register(Builtins.VersionCommand)
cli.register(CreateBirthCommand)
cli.register(StartCommand)
cli.register(CheckCommand)
