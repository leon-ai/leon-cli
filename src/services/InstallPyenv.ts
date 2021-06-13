import os from 'os'
import path from 'path'

import AdmZip from 'adm-zip'
import axios from 'axios'
import execa from 'execa'
import ora from 'ora'
import { log } from './Log'

import { checkEnvironmentVariable } from './Requirements'

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

  async getWindowsUserPath (): Promise<string> {
    if (process.platform !== 'win32') {
      return ''
    }
    const { stdout } = await execa('[Environment]::GetEnvironmentVariable(\'PATH\', \'User\');', [], { shell: 'powershell.exe' })
    return stdout
  }

  async downloadPython (): Promise<void> {
    const version = '3.9.4'
    const pythonLoader = ora(`Downloading python ${version}`).start()
    try {
      await execa(`pyenv install ${version} --quiet`)
      await execa(`pyenv global ${version}`)
      pythonLoader.succeed()
    } catch (error) {
      pythonLoader.fail()
      await log.error({
        stderr: `Could not install python ${version}`,
        commandPath: 'create birth',
        value: error.toString()
      })
    }
  }

  async rehash (): Promise<void> {
    const rehashLoader = ora('Rehashing Pyenv commands').start()
    try {
      await execa('pyenv rehash')
      rehashLoader.succeed()
    } catch (error) {
      rehashLoader.fail()
      await log.error({
        stderr: 'Could not rehash pyenv commands',
        commandPath: 'create birth',
        value: error.toString()
      })
    }
  }

  async registerInPath (pyenvPath: string): Promise<void> {
    const varEnvLoader = ora('Registering environment variables').start()
    try {
      if (!await checkEnvironmentVariable('PYENV', 'pyenv-win')) {
        process.env.PYENV = `${pyenvPath}\\pyenv-win\\`
        await execa(`[Environment]::SetEnvironmentVariable('PYENV', "${pyenvPath}\\pyenv-win\\",'User')`, [], { shell: 'powershell.exe' })
      }
      if (!await checkEnvironmentVariable('PYENV_HOME', 'pyenv-win')) {
        process.env.PYENV = `${pyenvPath}\\pyenv-win\\`
        await execa(`[Environment]::SetEnvironmentVariable('PYENV', "${pyenvPath}\\pyenv-win\\",'User')`, [], { shell: 'powershell.exe' })
      }
      if (!await checkEnvironmentVariable('PATH', 'pyenv-win\\bin') || !await checkEnvironmentVariable('PATH', 'pyenv-win\\shims')) {
        const userPath = await this.getWindowsUserPath()
        const extraPath = `${pyenvPath}\\pyenv-win\\bin;${pyenvPath}\\pyenv-win\\shims`
        await execa(`[Environment]::SetEnvironmentVariable('PATH', "${extraPath};${userPath}",'User')`, [], { shell: 'powershell.exe' })
        process.env.PATH = `${extraPath};${process.env.PATH ?? ''}`
      }
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
    await this.downloadPython()
    await this.rehash()
  }
}
