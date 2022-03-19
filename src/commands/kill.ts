import { Command, Option } from 'clipanion'

import { LeonInstance } from '../services/LeonInstance.js'
import { log } from '../services/Log.js'
import { prompt } from '../services/Prompt.js'

export class KillCommand extends Command {
  static paths = [['kill']]

  static usage = {
    description: 'Kill a Leon instance.'
  }

  public name = Option.String('--name', {
    description: 'Name of the Leon instance.'
  })

  public yes = Option.Boolean('--yes', {
    description: 'Skip all questions with a "yes" answer.'
  })

  async execute(): Promise<number> {
    try {
      const { yes = false } = this
      const leonInstance = LeonInstance.get(this.name)
      console.log(`You are about to kill Leon instance "${leonInstance.name}".`)
      if (yes || (await prompt.shouldExecute('Are you sure?'))) {
        await leonInstance.kill()
        console.log(`Leon instance "${leonInstance.name}" killed.`)
      }
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
