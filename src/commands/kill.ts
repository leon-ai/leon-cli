import { Command, Option } from 'clipanion'

import { LeonInstance } from '../services/LeonInstance.js'
import { log } from '../services/Log.js'

export class KillCommand extends Command {
  static paths = [['kill']]

  static usage = {
    description: 'Kill a Leon instance.'
  }

  public name = Option.String('--name', {
    description: 'Name of the Leon instance.'
  })

  async execute(): Promise<number> {
    try {
      const leonInstance = await LeonInstance.get(this.name)
      await leonInstance.kill()
      console.log(`Leon instance "${leonInstance.name}" killed.`)
      return 0
    } catch (error) {
      log.error({
        error,
        commandPath: 'kill'
      })
      return 1
    }
  }
}
