import { Command, Option } from 'clipanion'
import chalk from 'chalk'

import { Leon } from '../../services/Leon.js'
import { log } from '../../services/Log.js'
import { isLinux, isMacOS } from '../../utils/operatingSystem.js'

export class CreateBirthCommand extends Command {
  static paths = [['create', 'birth']]

  static usage = {
    description:
      'Brings Leon to life by checking all the requirements and install them with your approval.'
  }

  public useDevelopGitBranch = Option.Boolean('--develop', false, {
    description: 'Install Leon from the `develop` Git branch.'
  })

  public useDocker = Option.Boolean('--docker', false, {
    description: 'Install Leon with Docker.'
  })

  public useGit = Option.Boolean('--git', true, {
    description: 'Install Leon with Git (if possible).'
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

  public interactive = Option.Boolean('--interactive', {
    description: 'Interactive mode (ask questions).'
  })

  async execute(): Promise<number> {
    try {
      const leon = new Leon({
        useDevelopGitBranch: this.useDevelopGitBranch,
        birthPath: this.birthPath,
        version: this.version,
        useDocker: this.useDocker,
        useGit: this.useGit,
        name: this.name,
        interactive: this.interactive
      })
      await leon.createBirth()
      console.log(`\n${chalk.bold.green('Success:')} Leon is born! 🎉`)
      console.log('You can start your leon instance:')
      if (isLinux || isMacOS) {
        console.log(`${chalk.cyan('exec $SHELL')}`)
      } else {
        console.log(`First, restart your command prompt.`)
      }
      console.log(`${chalk.cyan('leon start')}`)
      return 0
    } catch (error) {
      log.error({
        error,
        commandPath: 'create birth'
      })
      return 1
    }
  }
}
