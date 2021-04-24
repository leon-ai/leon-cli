import os from 'os'
import path from 'path'

import AdmZip from 'adm-zip'
import axios from 'axios'
import execa from 'execa'
import ora from 'ora'

class InstallPyenv {
  public PYENV_WINDOWS_URL =
  'https://codeload.github.com/pyenv-win/pyenv-win/zip/master'

  async downloadPyenvWindowsZip (): Promise<AdmZip> {
    const downloadLoader = ora('Downloading Pyenv for Windows').start()
    try {
      const body = await axios.get(this.PYENV_WINDOWS_URL, {
        responseType: 'arraybuffer'
      })
      downloadLoader.succeed()
      return new AdmZip(body.data)
    } catch (error) {
      downloadLoader.fail()
      throw new Error(
        `Could not download Pyenv Windows zip located at ${
          this.PYENV_WINDOWS_URL
        } - ${error.message as string}`
      )
    }
  }

  async extractPyenvWindowsZip (
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
      throw new Error(
        `Impossible to register Pyenv environment variables - ${
          error.message as string
        }`
      )
    }
  }
}

export const installPyenv = new InstallPyenv()

export const installPyenvWindows = async (): Promise<void> => {
  const destination = path.join(os.homedir(), '.pyenv')
  const zip = await installPyenv.downloadPyenvWindowsZip()
  await installPyenv.extractPyenvWindowsZip(zip, destination)
  await installPyenv.registerPyenvInPath(destination)
}
