import { Command, Option } from 'clipanion'

import { LeonInstance } from '#src/services/LeonInstance.js'
import { Log } from '#src/services/Log.js'

export class CheckCommand extends Command {
  public static override paths = [['check']]

  public static override usage = {
    description: 'Check how the setup went.'
  }

  public name = Option.String('--name', {
    description: 'Name of the Leon instance.'
  })

  public static async run(leonInstance: LeonInstance): Promise<void> {
    await leonInstance.check()
  }

  public async execute(): Promise<number> {
    try {
      const leonInstance = await LeonInstance.get(this.name)
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
