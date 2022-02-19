import { Command, Option } from 'clipanion'

import { LeonInstance } from '../services/LeonInstance.js'
import { log } from '../services/Log.js'

export class CheckCommand extends Command {
  static paths = [['check']]

  static usage = {
    description: 'Check how the setup went.'
  }

  public name = Option.String('--name', {
    description: 'Name of the Leon instance.'
  })

  async execute(): Promise<number> {
    try {
      const leonInstance = LeonInstance.get(this.name)
      await leonInstance.check()
      return 0
    } catch (error) {
      log.error({
        error,
        commandPath: 'check'
      })
      return 1
    }
  }
}
