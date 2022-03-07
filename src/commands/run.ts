import { Command, Option } from 'clipanion'
import execa from 'execa'

import { LeonInstance } from '../services/LeonInstance.js'
import { log } from '../services/Log.js'
import { CheckCommand } from './check.js'
import { StartCommand } from './start.js'

interface Builtin {
  [key: string]: (leonInstance: LeonInstance) => Promise<void>
}

const BUILTIN_COMMANDS: Builtin = {
  start: StartCommand.run,
  check: CheckCommand.run
}

const BUILTIN_COMMANDS_KEYS = Object.keys(BUILTIN_COMMANDS)

export class RunCommand extends Command {
  static paths = [['run']]

  static usage = {
    description:
      'Run a npm script from a Leon Instance (e.g: `leon run train` runs `npm run train` in the leon instance folder).'
  }

  public name = Option.String('--name', {
    description: 'Name of the Leon instance.'
  })

  public script = Option.Proxy()

  async execute(): Promise<number> {
    try {
      const script = this.script.join(' ')
      const command = 'npm run ' + script
      const leonInstance = LeonInstance.get(this.name)
      const isBuiltin = BUILTIN_COMMANDS_KEYS.includes(script)
      if (isBuiltin) {
        const runCommand = BUILTIN_COMMANDS[script]
        await runCommand(leonInstance)
        return 0
      }
      process.chdir(leonInstance.path)
      await execa.command(command, { stdio: 'inherit' })
      return 0
    } catch (error) {
      log.error({
        error,
        commandPath: 'run'
      })
      return 1
    }
  }
}
