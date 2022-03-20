import path from 'node:path'

import { execa } from 'execa'
import ora from 'ora'

import { LogError } from '../../utils/LogError.js'
import {
  extractVersionForPath,
  getPythonSiteString,
  getPythonVersionString
} from '../../utils/pythonUtils.js'
import { addToPath } from '../../utils/pathUtils.js'
import { requirements } from '../Requirements.js'

class PipenvWindows {
  public async install(): Promise<void> {
    const pipenvLoader = ora('Installing pipenv').start()
    try {
      await execa('pip install --user pipenv')
      pipenvLoader.succeed()
    } catch (error: any) {
      pipenvLoader.fail()
      throw new LogError({
        message: 'Could not install pipenv',
        logFileMessage: error.toString()
      })
    }
  }

  private async addToWindowsPath(): Promise<void> {
    const pythonSitePath = await getPythonSiteString()
    const formattedPythonVersion = extractVersionForPath(
      await getPythonVersionString()
    )
    const fullPathToPythonSite = path.join(
      pythonSitePath,
      `Python${formattedPythonVersion}`,
      'Scripts'
    )
    if (
      !requirements.checkIfEnvironmentVariableContains(
        'PATH',
        fullPathToPythonSite
      )
    ) {
      await addToPath(fullPathToPythonSite)
    }
  }

  public async addToPath(): Promise<void> {
    const registeringPipenvLoader = ora('Registering pipenv to path').start()
    try {
      if (process.platform === 'win32') {
        await this.addToWindowsPath()
      }
      registeringPipenvLoader.succeed()
    } catch (error: any) {
      registeringPipenvLoader.fail()
      throw new LogError({
        message: 'Impossible to register Pipenv environment variables',
        logFileMessage: error.toString()
      })
    }
  }
}

export const pipenvWindows = new PipenvWindows()
