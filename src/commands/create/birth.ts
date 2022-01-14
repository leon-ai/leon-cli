import { Command, Option } from 'clipanion'
import chalk from 'chalk'

import { Leon } from '../../services/Leon'
import { log } from '../../services/Log'
import { isLinux, isMacOS } from '../../utils/operatingSystem'

export class CreateBirthCommand extends Command {
  static paths = [['create', 'birth']]

  static usage = {
    description:
      'Brings Leon to life by checking all requirements and install them with permissions from user.'
  }

  public useDevelopGitBranch = Option.Boolean('--develop', false, {
    description: 'Download Leon source code from the "develop" git branch.'
  })

  public useDocker = Option.Boolean('--docker', false, {
    description: 'Build and install Leon with the Docker image.'
  })

  public birthPath = Option.String('--path', {
    description: 'Choose the specific location to brings Leon to life.'
  })

  public version = Option.String('--version', {
    description: 'Install a specific version of Leon.'
  })

  public name = Option.String('--name', {
    description: 'Give a name to the new Leon instance.'
  })

  public yes = Option.Boolean('--yes', {
    description: 'Accept to install all requirements without being prompted.'
  })

  async execute(): Promise<number> {
    try {
      const leon = new Leon({
        useDevelopGitBranch: this.useDevelopGitBranch,
        birthPath: this.birthPath,
        version: this.version,
        useDocker: this.useDocker,
        name: this.name,
        yes: this.yes
      })
      await leon.createBirth()
      console.log(`\n${chalk.bold.green('Success:')} Leon is born! 🎉`)
      console.log('You can start your leon instance using:')
      if (isLinux || isMacOS) {
        console.log(`${chalk.cyan('exec $SHELL')}`)
      }
      console.log(`${chalk.cyan('leon start')}`)
      return 0
    } catch (error) {
      await log.error({
        error,
        commandPath: 'create birth'
      })
      return 1
    }
  }
}
