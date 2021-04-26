import { Command, Option } from 'clipanion'

import { Leon } from '../../services/Leon'

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

  async execute (): Promise<number> {
    const leon = new Leon({
      useDevelopGitBranch: this.useDevelopGitBranch,
      birthPath: this.birthPath,
      version: this.version,
      useDocker: this.useDocker
    })
    await leon.install()
    return 0
  }
}
