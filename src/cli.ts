import { Builtins, Cli } from 'clipanion'

import { Leon } from '#src/services/Leon.js'
import { packageJSON } from '#src/packageJSON.js'
import { CreateBirthCommand } from '#src/commands/create/birth.js'
import { CheckCommand } from '#src/commands/check.js'
import { HelpCommand } from '#src/commands/help.js'
import { InfoCommand } from '#src/commands/info.js'
import { DeleteCommand } from '#src/commands/delete.js'
import { RunCommand } from '#src/commands/run.js'
import { StartCommand } from '#src/commands/start.js'
import { UpdateCommand } from '#src/commands/update.js'

export const cli = new Cli({
  binaryLabel: Leon.NAME,
  binaryName: Leon.NAME,
  binaryVersion: packageJSON.version
})
cli.register(Builtins.HelpCommand)
cli.register(Builtins.VersionCommand)
cli.register(CreateBirthCommand)
cli.register(CheckCommand)
cli.register(DeleteCommand)
cli.register(HelpCommand)
cli.register(InfoCommand)
cli.register(RunCommand)
cli.register(StartCommand)
cli.register(UpdateCommand)
