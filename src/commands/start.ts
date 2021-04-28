import * as typanion from 'typanion'

import { Command, Option } from 'clipanion'
import { LeonInstance } from '../services/LeonInstance'
import { log } from '../services/Log'

export class StartCommand extends Command {
  static paths = [['start']]

  static usage = {
    description: 'Start a Leon instance.'
  }

  public port = Option.String('--port', {
    description: 'Specify listening server port.',
    validator: typanion.isNumber()
  })

  async execute (): Promise<number> {
    try {
      const leonInstance = await LeonInstance.get()
      await leonInstance.start(this.port)
      return 0
    } catch (error) {
      await log.error({
        stderr: error.message,
        commandPath: 'start'
      })
      return 1
    }
  }
}
