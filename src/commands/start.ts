import * as typanion from 'typanion'
import { Command, Option } from 'clipanion'

import { LeonInstance } from '../services/LeonInstance.js'
import { Log } from '../services/Log.js'

export class StartCommand extends Command {
  public static override paths = [['start']]

  public static override usage = {
    description: 'Start a Leon instance.'
  }

  public port = Option.String('--port', {
    description: 'Run a Leon instance with a specific port.',
    validator: typanion.isNumber()
  })

  public name = Option.String('--name', {
    description: 'Run a Leon instance with a specific name.'
  })

  public static async run(leonInstance: LeonInstance): Promise<void> {
    await leonInstance.start()
  }

  public async execute(): Promise<number> {
    try {
      const leonInstance = await LeonInstance.get(this.name)
      await leonInstance.start(this.port)
      return 0
    } catch (error) {
      const log = Log.getInstance()
      log.error({
        error,
        commandPath: 'start'
      })
      return 1
    }
  }
}
