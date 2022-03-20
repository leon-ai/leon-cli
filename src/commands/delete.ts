import { Command, Option } from 'clipanion'

import { LeonInstance } from '../services/LeonInstance.js'
import { log } from '../services/Log.js'
import { prompt } from '../services/Prompt.js'

export class DeleteCommand extends Command {
  static paths = [['delete']]

  static usage = {
    description: 'Delete a Leon instance.'
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
      console.log(
        `You are about to delete Leon instance "${leonInstance.name}".`
      )
      if (yes || (await prompt.shouldExecute('Are you sure?', 'no'))) {
        await leonInstance.delete()
        console.log(`Leon instance "${leonInstance.name}" deleted.`)
      }
      return 0
    } catch (error) {
      log.error({
        error,
        commandPath: 'delete'
      })
      return 1
    }
  }
}
