import { Builtins } from 'clipanion'

export class HelpCommand extends Builtins.HelpCommand {
  static paths = [['help']]

  static usage = {
    description: 'List all commands available in the CLI.'
  }
}
