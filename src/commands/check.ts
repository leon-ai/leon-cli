import { Command, Option } from 'clipanion'

import { LeonInstance } from '../services/LeonInstance.js'
import { Log } from '../services/Log.js'

export class CheckCommand extends Command {
  static paths = [['check']]

  static usage = {
    description: 'Check how the setup went.'
  }

  public name = Option.String('--name', {
    description: 'Name of the Leon instance.'
  })

  static async run(leonInstance: LeonInstance): Promise<void> {
    await leonInstance.check()
  }

  async execute(): Promise<number> {
    try {
      const leonInstance = LeonInstance.get(this.name)
      await leonInstance.check()
      return 0
    } catch (error) {
      const log = Log.getInstance()
      log.error({
        error,
        commandPath: 'check'
      })
      return 1
    }
  }
}
