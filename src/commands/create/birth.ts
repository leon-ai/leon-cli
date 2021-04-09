import os from 'os'
import path from 'path'

import AdmZip from 'adm-zip'
import axios from 'axios'
import { Command } from 'clipanion'
import execa from 'execa'
import { log } from '../../utils/log'
import ora from 'ora'
import { PYENV_WINDOWS_URL } from '../../utils/constants'

export class CreateBirthCommand extends Command {
  static paths = [['create', 'birth']]

  async downloadPyenvWindowsZip (url: string): Promise<AdmZip> {
    const downloadLoader = ora('Downloading Pyenv for Windows').start()

    try {
      const body = await axios.get(url, {
        responseType: 'arraybuffer'
      })
      downloadLoader.succeed()
      return new AdmZip(body.data)
    } catch (error) {
      downloadLoader.fail()
      throw new Error(`Could not download Pyenv Windows zip located at ${url} - ${error.message as string}`)
    }
  }

  async extractPyenvWindowsZip (zip: AdmZip, destination: string): Promise<void> {
    const extractLoader = ora('Extracting Pyenv zip').start()

    try {
      zip.getEntries().forEach(entry => {
        const filePath = path.join(
          destination,
          entry.entryName.replace('pyenv-win-master/', '')
        )

        if (!entry.isDirectory) {
          zip.extractEntryTo(entry.entryName, path.dirname(filePath), false, true)
        }
      })

      extractLoader.succeed()
    } catch (error) {
      extractLoader.fail()
      throw new Error(`Could not extract Pyenv Windows zip - ${error.message as string}`)
    }
  }

  async registerPyenvInPath (pyenvPath: string): Promise<void> {
    const varEnvLoader = ora('Registering environment variables').start()

    try {
      await execa(`setx PYENV ${pyenvPath}pyenv-win\\`)
      await execa(
        `setx path "${
          process.env.PATH ?? ''
        };${pyenvPath}pyenv-win\\bin;${pyenvPath}pyenv-win\\shims`
      )
      varEnvLoader.succeed()
    } catch (error) {
      varEnvLoader.fail()
      throw new Error(`Impossible to register Pyenv environment variables - ${error.message as string}`)
    }
  }

  async installPyenvWindows (): Promise<void> {
    const destination = `${os.homedir()}\\.pyenv\\`

    const zip = await this.downloadPyenvWindowsZip(PYENV_WINDOWS_URL)
    await this.extractPyenvWindowsZip(zip, destination)
    await this.registerPyenvInPath(destination)
  }

  async execute (): Promise<number> {
    try {
      await this.installPyenvWindows()
    } catch (error) {
      log.error(error.message as string)
      console.error('For further informations, look at the log file')
    }

    return 0
  }
}
