import { Command, Option } from 'clipanion'
import chalk from 'chalk'

import { config } from '#src/services/Config.js'
import { LeonInstance } from '#src/services/LeonInstance.js'
import { Log } from '#src/services/Log.js'

export class InfoCommand extends Command {
  public static override paths = [['info']]

  public static override usage = {
    description: 'Get basic information about installed Leon instances.'
  }

  public name = Option.String('--name', {
    description: 'Name of the Leon instance.'
  })

  public static logNoInstancesFound(): void {
    console.log(chalk.bold('No Leon instances found.'))
    console.log('You can give birth to a Leon instance using:')
    console.log(chalk.cyan('leon create birth'))
  }

  public async execute(): Promise<number> {
    try {
      if (this.name != null) {
        console.log()
        const leonInstance = await LeonInstance.get(this.name)
        console.log(await leonInstance.info())
      } else {
        const instances = config.get('instances', [])
        if (instances.length === 0) {
          InfoCommand.logNoInstancesFound()
        } else {
          let infoResult = ''
          for (const instance of instances) {
            const leonInstance = await LeonInstance.find(instance.name)
            if (leonInstance != null) {
              infoResult += (await leonInstance.info()) + '\n'
              infoResult += '------------------------------\n\n'
            }
          }
          if (infoResult.length === 0) {
            InfoCommand.logNoInstancesFound()
          } else {
            console.log(chalk.cyan('\nLeon instances:\n'))
            console.log(infoResult)
          }
        }
      }
      return 0
    } catch (error) {
      const log = Log.getInstance()
      log.error({
        error,
        commandPath: 'info'
      })
      return 1
    }
  }
}
