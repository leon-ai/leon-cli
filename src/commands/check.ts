import { Command, Option } from 'clipanion'

import { LeonInstance } from '../services/LeonInstance'
import { log } from '../services/Log'

export class CheckCommand extends Command {
  static paths = [['check']]

  static usage = {
    description: 'Check the setup went well for a Leon instance.'
  }

  public name = Option.String('--name', {
    description: 'Specify the instance name to check.'
  })

  async execute(): Promise<number> {
    try {
      const leonInstance = await LeonInstance.get(this.name)
      await leonInstance.check()
      return 0
    } catch (error: unknown) {
      await log.error({
        error,
        commandPath: 'check'
      })
      return 1
    }
  }
}
