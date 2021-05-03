import os from 'os'
import path from 'path'

import AdmZip from 'adm-zip'
import axios from 'axios'
import execa from 'execa'
import ora from 'ora'
import { log } from './Log'

export class InstallPyenv {
  static PYENV_WINDOWS_URL =
  'https://codeload.github.com/pyenv-win/pyenv-win/zip/master'

  public async downloadWindowsZip (): Promise<AdmZip | undefined> {
    const downloadLoader = ora('Downloading Pyenv for Windows').start()
    try {
      const body = await axios.get(InstallPyenv.PYENV_WINDOWS_URL, {
        responseType: 'arraybuffer'
      })
      downloadLoader.succeed()
      return new AdmZip(body.data)
    } catch (error) {
      downloadLoader.fail()
      await log.error({
        stderr: `Could not download Pyenv Windows zip located at ${InstallPyenv.PYENV_WINDOWS_URL}`,
        commandPath: 'create birth',
        value: error.toString()
      })
    }
  }

  public async extractWindowsZip (
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
      await log.error({
        stderr: 'Could not extract Pyenv Windows zip',
        commandPath: 'create birth',
        value: error.toString()
      })
    }
  }

  public async registerInPath (pyenvPath: string): Promise<void> {
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
      await log.error({
        stderr: 'Impossible to register Pyenv environment variables',
        commandPath: 'create birth',
        value: error.toString()
      })
    }
  }

  public async onWindows (): Promise<void> {
    const destination = path.join(os.homedir(), '.pyenv')
    const zip = await this.downloadWindowsZip()
    if (zip != null) {
      await this.extractWindowsZip(zip, destination)
      await this.registerInPath(destination)
    }
  }
}
