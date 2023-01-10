import { Builtins } from 'clipanion'

export class HelpCommand extends Builtins.HelpCommand {
  public static override paths = [['help']]

  public static override usage = {
    description: 'List all commands available in the CLI.'
  }
}
