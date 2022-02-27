import { Command, Option } from 'clipanion'
import chalk from 'chalk'

import { Leon } from '../services/Leon.js'
import { LeonInstance } from '../services/LeonInstance.js'
import { log } from '../services/Log.js'

export class UpdateCommand extends Command {
  static paths = [['update']]

  static usage = {
    description: 'Update a Leon instance.'
  }

  public name = Option.String('--name', {
    description: 'Name of the Leon instance.'
  })

  public version = Option.String('--version', {
    description: 'Update to a specific version of Leon.'
  })

  public useDevelopGitBranch = Option.Boolean('--develop', false, {
    description: 'Update Leon to latest `develop` Git branch.'
  })

  public useGit = Option.Boolean('--git', true, {
    description: 'Update Leon with Git (if possible).'
  })

  public yes = Option.Boolean('--yes', {
    description: 'Skip all questions with a "yes" answer.'
  })

  async execute(): Promise<number> {
    try {
      const leonInstance = LeonInstance.get(this.name)
      const leon = new Leon({
        useDevelopGitBranch: this.useDevelopGitBranch,
        birthPath: leonInstance.path,
        version: this.version,
        useDocker: leonInstance.mode === 'docker',
        useGit: this.useGit,
        name: leonInstance.name,
        yes: this.yes
      })
      let version = await leonInstance.getVersion()
      console.log(
        chalk.cyan(
          `\nLeon instance "${leonInstance.name}" is currently at version ${version}.\n`
        )
      )
      await leonInstance.update(leon)
      version = await leonInstance.getVersion()
      console.log(
        chalk.cyan(
          `\nLeon instance "${leonInstance.name}" has now been updated to version ${version}.\n`
        )
      )
      return 0
    } catch (error) {
      log.error({
        error,
        commandPath: 'update'
      })
      return 1
    }
  }
}
