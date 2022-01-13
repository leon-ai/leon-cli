import os from 'node:os'
import path from 'node:path'

import AdmZip from 'adm-zip'
import axios from 'axios'
import execa from 'execa'
import ora from 'ora'

import { requirements } from './Requirements'
import { LogError } from '../utils/LogError'

class Pyenv {
  static WINDOWS_URL =
    'https://codeload.github.com/pyenv-win/pyenv-win/zip/master'

  static PYTHON_VERSION = '3.10.0'

  public async downloadWindowsZip(): Promise<AdmZip | undefined> {
    const downloadLoader = ora('Downloading Pyenv for Windows').start()
    try {
      const body = await axios.get(Pyenv.WINDOWS_URL, {
        responseType: 'arraybuffer'
      })
      downloadLoader.succeed()
      return new AdmZip(body.data)
    } catch (error: any) {
      downloadLoader.fail()
      throw new LogError({
        message: `Could not download Pyenv Windows zip located at ${Pyenv.WINDOWS_URL}`,
        logFileMessage: error.toString()
      })
    }
  }

  public async extractWindowsZip(
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
      `Installing python ${Pyenv.PYTHON_VERSION}`
    ).start()
    try {
      await execa(`pyenv install ${Pyenv.PYTHON_VERSION}`)
      await execa('pyenv rehash')
      await execa(`pyenv global ${Pyenv.PYTHON_VERSION}`)
      pythonLoader.succeed()
    } catch (error: any) {
      pythonLoader.fail()
      throw new LogError({
        message: `Could not install python ${Pyenv.PYTHON_VERSION}`,
        logFileMessage: error.toString()
      })
    }
  }

  public async registerInPathWindows(pyenvPath: string): Promise<void> {
    const varEnvLoader = ora('Registering environment variables').start()
    try {
      if (
        !(await requirements.checkEnvironmentVariable('PYENV', 'pyenv-win'))
      ) {
        process.env.PYENV = `${pyenvPath}\\pyenv-win\\`
        await execa(
          `[Environment]::SetEnvironmentVariable('PYENV', "${pyenvPath}\\pyenv-win\\",'User')`,
          [],
          { shell: 'powershell.exe' }
        )
      }
      if (
        !(await requirements.checkEnvironmentVariable(
          'PYENV_HOME',
          'pyenv-win'
        ))
      ) {
        process.env.PYENV = `${pyenvPath}\\pyenv-win\\`
        await execa(
          `[Environment]::SetEnvironmentVariable('PYENV', "${pyenvPath}\\pyenv-win\\",'User')`,
          [],
          { shell: 'powershell.exe' }
        )
      }
      if (
        !(await requirements.checkEnvironmentVariable(
          'PATH',
          'pyenv-win\\bin'
        )) ||
        !(await requirements.checkEnvironmentVariable(
          'PATH',
          'pyenv-win\\shims'
        ))
      ) {
        const userPath = await this.getWindowsUserPath()
        const extraPath = `${pyenvPath}\\pyenv-win\\bin;${pyenvPath}\\pyenv-win\\shims`
        await execa(
          `[Environment]::SetEnvironmentVariable('PATH', "${extraPath};${userPath}",'User')`,
          [],
          { shell: 'powershell.exe' }
        )
        process.env.PATH = `${extraPath};${process.env.PATH ?? ''}`
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

  public async installOnWindows(): Promise<void> {
    const destination = path.join(os.homedir(), '.pyenv')
    const zip = await this.downloadWindowsZip()
    if (zip != null) {
      await this.extractWindowsZip(zip, destination)
      await this.registerInPathWindows(destination)
    }
  }

  public async installOnLinux(): Promise<void> {}

  public async install(): Promise<void> {
    const isWindows = process.platform === 'win32'
    const isLinux = process.platform === 'linux'
    if (isWindows) {
      await this.installOnWindows()
    } else if (isLinux) {
      await this.installOnLinux()
    }
    await this.installPython()
  }
}

export const pyenv = new Pyenv()
