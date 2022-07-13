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
import { LogError } from '../../utils/LogError.js'
import { copyDirectory } from '../../utils/copyDirectory.js'
import {
  addToPathOnWindows,
  addEnvironmentVariableOnWindows,
  getWindowsUserPath
} from '../../utils/pathUtils.js'
import { isExistingPath } from '../../utils/isExistingPath.js'
import { requirements } from '../Requirements.js'

class PyenvWindows {
  static NAME = 'pyenv-win'
  static GITHUB_URL = `https://github.com/${PyenvWindows.NAME}/${PyenvWindows.NAME}`
  static PYENV_PATH = path.join(os.homedir(), '.pyenv')
  static PYENV_WIN_PATH = `${PyenvWindows.PYENV_PATH}\\${PyenvWindows.NAME}\\`
  static PYENV_WIN_PATH_VALUE = `${PyenvWindows.PYENV_WIN_PATH}\\bin;${PyenvWindows.PYENV_WIN_PATH}\\shims`
  static PYTHON_VERSION = '3.9.10'

  private async installPython(): Promise<void> {
    const pythonLoader = ora(
      `Installing python ${PyenvWindows.PYTHON_VERSION}`
    ).start()
    try {
      await execa(`pyenv install ${PyenvWindows.PYTHON_VERSION}`)
      await execa(`pyenv rehash`)
      await execa(`pyenv global ${PyenvWindows.PYTHON_VERSION}`)
      const path = await getWindowsUserPath()
      process.env.PATH = `${path};${process.env.PATH ?? ''};`
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
      await addEnvironmentVariableOnWindows(
        'PYENV',
        PyenvWindows.PYENV_WIN_PATH
      )
      await addEnvironmentVariableOnWindows(
        'PYENV_ROOT',
        PyenvWindows.PYENV_WIN_PATH
      )
      await addEnvironmentVariableOnWindows(
        'PYENV_HOME',
        PyenvWindows.PYENV_WIN_PATH
      )
      await addToPathOnWindows(PyenvWindows.PYENV_WIN_PATH_VALUE)
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
      const pyenvExtractedPath = path.join(TEMPORARY_PATH, folderName)
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
        message: `Could not install Pyenv`,
        logFileMessage: error.toString()
      })
    }
  }

  public async install(): Promise<void> {
    const hasPyenv =
      (await isExistingPath(PyenvWindows.PYENV_PATH)) ||
      (await requirements.checkSoftware('pyenv'))
    if (!hasPyenv) {
      await this.installPyenv()
      await this.registerInPath()
    }
    await this.installPython()
  }
}

export const pyenvWindows = new PyenvWindows()
