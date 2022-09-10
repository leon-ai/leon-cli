import { Command, Option } from 'clipanion'
import chalk from 'chalk'

import { Leon } from '../services/Leon.js'
import { LeonInstance } from '../services/LeonInstance.js'
import { Log } from '../services/Log.js'

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

  async execute(): Promise<number> {
    try {
      const leonInstance = await LeonInstance.get(this.name)
      const leon = new Leon({
        useDevelopGitBranch: this.useDevelopGitBranch,
        birthPath: leonInstance.path,
        version: this.version,
        useDocker: leonInstance.mode === 'docker',
        useGit: this.useGit,
        name: leonInstance.name,
        interactive: false
      })
      const oldVersion = await leonInstance.getVersion()
      console.log(
        chalk.cyan(
          `\nLeon instance "${leonInstance.name}" is currently at version ${oldVersion}.\n`
        )
      )
      await leonInstance.update(leon)
      const newVersion = await leonInstance.getVersion()
      if (oldVersion === newVersion) {
        console.log(
          chalk.cyan(
            `\nLeon instance "${leonInstance.name}" is already using the latest version.\n`
          )
        )
      } else {
        console.log(
          chalk.cyan(
            `\nLeon instance "${leonInstance.name}" has now been updated to version ${newVersion}.\n`
          )
        )
      }
      return 0
    } catch (error) {
      const log = Log.getInstance()
      log.error({
        error,
        commandPath: 'update'
      })
      return 1
    }
  }
}
