import { Command, Option } from 'clipanion'
import { table } from 'table'
import chalk from 'chalk'
import date from 'date-and-time'
import readPackage from 'read-pkg'

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
      console.log(chalk.cyan('\nLeon instances:\n'))
      const instances = config.get('instances', [])
      for (const instance of instances) {
        const leonInstance = new LeonInstance(instance)
        const birthDay = new Date(leonInstance.birthDate)
        const birthDayString = date.format(birthDay, 'DD/MM/YYYY - HH:mm:ss')
        const packageJSON = readPackage.sync({ cwd: leonInstance.path })
        console.log(
          table([
            [chalk.bold('Name'), leonInstance.name],
            [chalk.bold('Path'), leonInstance.path],
            [chalk.bold('Mode'), leonInstance.mode],
            [chalk.bold('Birthday'), birthDayString],
            [chalk.bold('Version'), packageJSON.version]
          ])
        )
        console.log('------------------------------\n')
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
