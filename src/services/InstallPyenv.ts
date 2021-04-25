import os from 'os'
import path from 'path'

import AdmZip from 'adm-zip'
import axios from 'axios'
import execa from 'execa'
import ora from 'ora'

export class InstallPyenv {
  static PYENV_WINDOWS_URL =
  'https://codeload.github.com/pyenv-win/pyenv-win/zip/master'

  private async downloadWindowsZip (): Promise<AdmZip> {
    const downloadLoader = ora('Downloading Pyenv for Windows').start()
    try {
      const body = await axios.get(InstallPyenv.PYENV_WINDOWS_URL, {
        responseType: 'arraybuffer'
      })
      downloadLoader.succeed()
      return new AdmZip(body.data)
    } catch (error) {
      downloadLoader.fail()
      throw new Error(
        `Could not download Pyenv Windows zip located at ${
          InstallPyenv.PYENV_WINDOWS_URL
        } - ${error.message as string}`
      )
    }
  }

  private async extractWindowsZip (
    zip: AdmZip,
    destination: string
  ): Promise<void> {
    const extractLoader = ora('Extracting Pyenv zip').start()
    try {
      zip.getEntries().forEach((entry) => {
        const filePath = path.join(
          destination,
          entry.entryName.replace('pyenv-win-master/', '')
        )
        if (!entry.isDirectory) {
          zip.extractEntryTo(
            entry.entryName,
            path.dirname(filePath),
            false,
            true
          )
        }
      })
      extractLoader.succeed()
    } catch (error) {
      extractLoader.fail()
      throw new Error(
        `Could not extract Pyenv Windows zip - ${error.message as string}`
      )
    }
  }

  private async registerInPath (pyenvPath: string): Promise<void> {
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
      throw new Error(
        `Impossible to register Pyenv environment variables - ${
          error.message as string
        }`
      )
    }
  }

  public async installWindows (): Promise<void> {
    const destination = path.join(os.homedir(), '.pyenv')
    const zip = await this.downloadWindowsZip()
    await this.extractWindowsZip(zip, destination)
    await this.registerInPath(destination)
  }
}
