import { Command, Option } from 'clipanion'
import { execaCommand } from 'execa'

import { LeonInstance } from '../services/LeonInstance.js'
import { Log } from '../services/Log.js'
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
  public static override paths = [['run']]

  public static override usage = {
    description:
      'Run a npm script from a Leon Instance (e.g: `leon run train` runs `npm run train` in the leon instance folder).'
  }

  public name = Option.String('--name', {
    description: 'Name of the Leon instance.'
  })

  public script = Option.Proxy()

  public async execute(): Promise<number> {
    try {
      const script = this.script.join(' ')
      const command = 'npm run ' + script
      const leonInstance = await LeonInstance.get(this.name)
      const isBuiltin = BUILTIN_COMMANDS_KEYS.includes(script)
      if (isBuiltin) {
        const runCommand = BUILTIN_COMMANDS[script]
        if (runCommand != null) {
          await runCommand(leonInstance)
          return 0
        }
        throw new Error('Unknown builtin command: ' + script)
      }
      process.chdir(leonInstance.path)
      await execaCommand(command, { stdio: 'inherit' })
      return 0
    } catch (error) {
      const log = Log.getInstance()
      log.error({
        error,
        commandPath: 'run'
      })
      return 1
    }
  }
}
