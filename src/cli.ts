import { Builtins, Cli } from 'clipanion'

import { Leon } from './services/Leon.js'
import { packageJSON } from './packageJSON.js'
import { CreateBirthCommand } from './commands/create/birth.js'
import { CheckCommand } from './commands/check.js'
import { HelpCommand } from './commands/help.js'
import { StartCommand } from './commands/start.js'
import { InfoCommand } from './commands/info.js'

export const cli = new Cli({
  binaryLabel: Leon.NAME,
  binaryName: Leon.NAME,
  binaryVersion: packageJSON.version
})
cli.register(Builtins.HelpCommand)
cli.register(Builtins.VersionCommand)
cli.register(CreateBirthCommand)
cli.register(CheckCommand)
cli.register(HelpCommand)
cli.register(InfoCommand)
cli.register(StartCommand)
