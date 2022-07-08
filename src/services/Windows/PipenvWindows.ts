import path from 'node:path'

import { execaCommand } from 'execa'
import ora from 'ora'

import { LogError } from '../../utils/LogError.js'
import {
  extractVersionForPath,
  getPythonSiteString,
  getPythonVersionString
} from '../../utils/pythonUtils.js'
import { addToPathOnWindows } from '../../utils/pathUtils.js'

class PipenvWindows {
  public async install(): Promise<void> {
    const pipenvLoader = ora('Installing pipenv').start()
    try {
      await execaCommand('pip install --user pipenv', {
        shell: 'powershell.exe'
      })
      await this.addToPath()
      pipenvLoader.succeed()
    } catch (error: any) {
      pipenvLoader.fail()
      throw new LogError({
        message: 'Could not install pipenv',
        logFileMessage: error.toString()
      })
    }
  }

  public async addToPath(): Promise<void> {
    try {
      const pythonSitePath = await getPythonSiteString()
      const formattedPythonVersion = extractVersionForPath(
        await getPythonVersionString()
      )
      const fullPathToPythonSite = path.join(
        pythonSitePath,
        `Python${formattedPythonVersion}`,
        'Scripts'
      )
      await addToPathOnWindows(fullPathToPythonSite)
    } catch (error: any) {
      throw new LogError({
        message: 'Impossible to register Pipenv environment variables',
        logFileMessage: error.toString()
      })
    }
  }
}

export const pipenvWindows = new PipenvWindows()
