import os from 'node:os'
import fs from 'node:fs'
import path from 'node:path'

import extractZip from 'extract-zip'
import axios from 'axios'
import { execa } from 'execa'
import ora from 'ora'

import {
  createTemporaryEmptyFolder,
  TEMPORARY_PATH
} from '../../utils/createTemporaryEmptyFolder.js'
import { requirements } from '../Requirements.js'
import { LogError } from '../../utils/LogError.js'
import { addToPath, saveEnvironmentVariable } from '../../utils/pathUtils.js'
import { copyDirectory } from '../../utils/copyDirectory.js'

class PyenvWindows {
  static NAME = 'pyenv-win'
  static GITHUB_URL = `https://github.com/${PyenvWindows.NAME}/${PyenvWindows.NAME}`
  static PYENV_PATH = path.join(os.homedir(), '.pyenv')
  static PYTHON_VERSION = '3.9.10'

  private async getWindowsUserPath(): Promise<string> {
    const { stdout } = await execa(
      "[Environment]::GetEnvironmentVariable('PATH', 'User');",
      [],
      { shell: 'powershell.exe' }
    )
    return stdout
  }

  private async installPython(): Promise<void> {
    const pythonLoader = ora(
      `Installing python ${PyenvWindows.PYTHON_VERSION}`
    ).start()
    try {
      const pyenvCommand = `${PyenvWindows.PYENV_PATH}\\bin\\pyenv`
      await execa(`${pyenvCommand} install ${PyenvWindows.PYTHON_VERSION}`)
      await execa(`${pyenvCommand} rehash`)
      await execa(`${pyenvCommand} global ${PyenvWindows.PYTHON_VERSION}`)
      pythonLoader.succeed()
    } catch (error: any) {
      pythonLoader.fail()
      throw new LogError({
        message: `Could not install python ${PyenvWindows.PYTHON_VERSION}`,
        logFileMessage: error.toString()
      })
    }
  }

  private async registerInPath(): Promise<void> {
    const varEnvLoader = ora('Registering environment variables').start()
    try {
      if (
        !requirements.checkIfEnvironmentVariableContains(
          'PYENV',
          PyenvWindows.NAME
        )
      ) {
        process.env.PYENV = `${PyenvWindows.PYENV_PATH}\\${PyenvWindows.NAME}\\`
        await saveEnvironmentVariable(
          'PYENV',
          `${PyenvWindows.PYENV_PATH}\\${PyenvWindows.NAME}\\`
        )
      }
      if (
        !requirements.checkIfEnvironmentVariableContains(
          'PYENV_HOME',
          PyenvWindows.NAME
        )
      ) {
        process.env.PYENV_HOME = `${PyenvWindows.PYENV_PATH}\\${PyenvWindows.NAME}\\`
        await saveEnvironmentVariable(
          'PYENV_HOME',
          `${PyenvWindows.PYENV_PATH}\\${PyenvWindows.NAME}\\`
        )
      }
      if (
        !requirements.checkIfEnvironmentVariableContains(
          'PATH',
          `${PyenvWindows.NAME}\\bin`
        )
      ) {
        const binPath = `${PyenvWindows.PYENV_PATH}\\${PyenvWindows.NAME}\\bin`
        await addToPath(binPath)
      }
      if (
        !requirements.checkIfEnvironmentVariableContains(
          'PATH',
          `${PyenvWindows.NAME}\\shims`
        )
      ) {
        const shimsPath = `${PyenvWindows.PYENV_PATH}\\${PyenvWindows.NAME}\\shims`
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

  private async installPyenv(): Promise<void> {
    const loader = ora('Installing Pyenv for Windows').start()
    try {
      const version = 'master'
      const folderName = `${PyenvWindows.NAME}-${version}`
      const zipName = `${folderName}.zip`
      const url = `${PyenvWindows.GITHUB_URL}/archive/${version}.zip`
      const pyenvZipPath = path.join(TEMPORARY_PATH, zipName)
      const pyenvExtractedPath = path.join(
        TEMPORARY_PATH,
        folderName,
        PyenvWindows.NAME
      )
      await createTemporaryEmptyFolder()
      const { data } = await axios.get(url, {
        responseType: 'arraybuffer'
      })
      await fs.promises.writeFile(pyenvZipPath, Buffer.from(data), {
        encoding: 'binary'
      })
      await extractZip(pyenvZipPath, { dir: TEMPORARY_PATH })
      await fs.promises.mkdir(PyenvWindows.PYENV_PATH, {
        recursive: true
      })
      await copyDirectory(pyenvExtractedPath, PyenvWindows.PYENV_PATH)
      loader.succeed()
    } catch (error: any) {
      loader.fail()
      throw new LogError({
        message: `Could not install Pyenv Windows`,
        logFileMessage: error.toString()
      })
    }
  }

  public async install(): Promise<void> {
    await this.installPyenv()
    await this.registerInPath()
    await this.installPython()
  }
}

export const pyenvWindows = new PyenvWindows()
