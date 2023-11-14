import { Command, Option } from 'clipanion'
import chalk from 'chalk'

import { Leon } from '#src/services/Leon.js'
import { Log } from '#src/services/Log.js'

export class CreateBirthCommand extends Command {
  public static override paths = [['create', 'birth']]

  public static override usage = {
    description: 'Brings Leon to life.'
  }

  public useDevelopGitBranch = Option.Boolean('--develop', false, {
    description: 'Install Leon from the `develop` Git branch.'
  })

  public useDocker = Option.Boolean('--docker', false, {
    description: 'Install Leon with Docker.'
  })

  public birthPath = Option.String('--path', {
    description: 'Location of your Leon instance.'
  })

  public version = Option.String('--version', {
    description: 'Install a specific version of Leon.'
  })

  public name = Option.String('--name', {
    description: 'Give a name to your Leon instance.'
  })

  public async execute(): Promise<number> {
    try {
      const leon = new Leon({
        useDevelopGitBranch: this.useDevelopGitBranch,
        birthPath: this.birthPath,
        version: this.version,
        useDocker: this.useDocker,
        name: this.name
      })
      await leon.createBirth()
      console.log(`\n${chalk.bold.green('Success:')} Leon is born! 🎉`)
      console.log('You can start your leon instance:')
      console.log(`${chalk.cyan('leon start')}`)
      return 0
    } catch (error) {
      const log = Log.getInstance()
      log.error({
        error,
        commandPath: 'create birth'
      })
      return 1
    }
  }
}
