import { Command, Option } from 'clipanion'
import chalk from 'chalk'

import { config } from '../services/Config.js'
import { LeonInstance } from '../services/LeonInstance.js'
import { log } from '../services/Log.js'

export class InfoCommand extends Command {
  static paths = [['info']]

  static usage = {
    description: 'Get basic information about installed Leon instances.'
  }

  public name = Option.String('--name', {
    description: 'Name of the Leon instance.'
  })

  async execute(): Promise<number> {
    try {
      if (this.name != null) {
        console.log()
        const leonInstance = await LeonInstance.get(this.name)
        leonInstance.logInfo()
      } else {
        console.log(chalk.cyan('\nLeon instances:\n'))
        const instances = config.get('instances', [])
        for (const instance of instances) {
          const leonInstance = new LeonInstance(instance)
          leonInstance.logInfo()
          console.log('------------------------------\n')
        }
      }
      return 0
    } catch (error) {
      await log.error({
        error,
        commandPath: 'info'
      })
      return 1
    }
  }
}
