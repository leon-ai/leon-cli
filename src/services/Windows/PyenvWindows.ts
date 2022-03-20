import os from 'node:os'
import path from 'node:path'

import AdmZip from 'adm-zip'
import axios from 'axios'
import { execa } from 'execa'
import ora from 'ora'

import { requirements } from '../Requirements.js'
import { LogError } from '../../utils/LogError.js'
import { addToPath, saveEnvironmentVariable } from '../../utils/pathUtils.js'

class PyenvWindows {
  static URL = 'https://codeload.github.com/pyenv-win/pyenv-win/zip/master'

  static PYTHON_VERSION = '3.10.0b3'

  public async downloadWindowsZip(): Promise<AdmZip> {
    const downloadLoader = ora('Downloading Pyenv for Windows').start()
    try {
      const body = await axios.get(PyenvWindows.URL, {
        responseType: 'arraybuffer'
      })
      downloadLoader.succeed()
      return new AdmZip(body.data)
    } catch (error: any) {
      downloadLoader.fail()
      throw new LogError({
        message: `Could not download Pyenv Windows zip located at ${PyenvWindows.URL}`,
        logFileMessage: error.toString()
      })
    }
  }

  public extractWindowsZip(zip: AdmZip, destination: string): void {
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
    } catch (error: any) {
      extractLoader.fail()
      throw new LogError({
        message: `Could not extract Pyenv Windows zip`,
        logFileMessage: error.toString()
      })
    }
  }

  public async getWindowsUserPath(): Promise<string> {
    if (process.platform !== 'win32') {
      return ''
    }
    const { stdout } = await execa(
      "[Environment]::GetEnvironmentVariable('PATH', 'User');",
      [],
      { shell: 'powershell.exe' }
    )
    return stdout
  }

  public async installPython(): Promise<void> {
    const pythonLoader = ora(
      `Installing python ${PyenvWindows.PYTHON_VERSION}`
    ).start()
    try {
      await execa(`pyenv install ${PyenvWindows.PYTHON_VERSION}`)
      await execa('pyenv rehash')
      await execa(`pyenv global ${PyenvWindows.PYTHON_VERSION}`)
      pythonLoader.succeed()
    } catch (error: any) {
      pythonLoader.fail()
      throw new LogError({
        message: `Could not install python ${PyenvWindows.PYTHON_VERSION}`,
        logFileMessage: error.toString()
      })
    }
  }

  public async registerInPathWindows(pyenvPath: string): Promise<void> {
    const varEnvLoader = ora('Registering environment variables').start()
    const pyenvWin = 'pyenv-win'
    try {
      if (!requirements.checkIfEnvironmentVariableContains('PYENV', pyenvWin)) {
        process.env.PYENV = `${pyenvPath}\\${pyenvWin}\\`
        await saveEnvironmentVariable('PYENV', `${pyenvPath}\\${pyenvWin}\\`)
      }
      if (
        !requirements.checkIfEnvironmentVariableContains('PYENV_HOME', pyenvWin)
      ) {
        process.env.PYENV_HOME = `${pyenvPath}\\${pyenvWin}\\`
        await saveEnvironmentVariable(
          'PYENV_HOME',
          `${pyenvPath}\\${pyenvWin}\\`
        )
      }
      if (
        !requirements.checkIfEnvironmentVariableContains(
          'PATH',
          `${pyenvWin}\\bin`
        )
      ) {
        const binPath = `${pyenvPath}\\${pyenvWin}\\bin`
        await addToPath(binPath)
      }
      if (
        !requirements.checkIfEnvironmentVariableContains(
          'PATH',
          `${pyenvWin}\\shims`
        )
      ) {
        const shimsPath = `${pyenvPath}\\${pyenvWin}\\shims`
        await addToPath(shimsPath)
      }
      varEnvLoader.succeed()
    } catch (error: any) {
      varEnvLoader.fail()
      throw new LogError({
        message: 'Impossible to register Pyenv environment variables',
        logFileMessage: error.toString()
      })
    }
  }

  public async install(): Promise<void> {
    const destination = path.join(os.homedir(), '.pyenv')
    const zip = await this.downloadWindowsZip()
    this.extractWindowsZip(zip, destination)
    await this.registerInPathWindows(destination)
    await this.installPython()
  }
}

export const pyenvWindows = new PyenvWindows()
