import { Command, Option } from 'clipanion'

import { Leon } from '../../services/Leon'
import { prompt } from '../../services/Prompt'
import { checkPython } from '../../services/Requirements'
import { InstallPyenv } from '../../services/InstallPyenv'
import { installPipenv } from '../../services/Pipenv'

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

  async execute (): Promise<number> {

    const hasPython = await checkPython()
    if (!hasPython) {
      const shouldInstallPython = await prompt('Python')
      if (this.yes || shouldInstallPython) {
        const installPyenv = new InstallPyenv()
        await installPyenv.onWindows()
      }
    }

    const shouldInstallPipenv = await prompt('Pipenv')
    if (this.yes || shouldInstallPipenv) {
      await installPipenv()
      const installPyenv = new InstallPyenv()
      installPyenv.rehash()
    }

    const leon = new Leon({
      useDevelopGitBranch: this.useDevelopGitBranch,
      birthPath: this.birthPath,
      version: this.version,
      useDocker: this.useDocker,
      name: this.name,
      yes: this.yes
    })
    //await leon.install()
    return 0
  }
}
