import execa from 'execa'
import ora from 'ora'

import { requirements } from './Requirements'
import { LogError } from '../utils/LogError'

class Pipenv {
  public async install(): Promise<void> {
    const pipenvLoader = ora('Installing pipenv').start()
    try {
      await execa('pip install pipenv')
      await pipenv.setPath()
      pipenvLoader.succeed()
    } catch (error: any) {
      pipenvLoader.fail()
      throw new LogError({
        message: 'Could not install pipenv',
        logFileMessage: error.toString()
      })
    }
  }

  public async setPath(): Promise<void> {
    const appdataDir =
      process.env.APPDATA ??
      (process.platform === 'darwin'
        ? process.env.HOME ?? '' + '/Library/Preferences'
        : process.env.HOME ?? '' + '/.local/share')
    const sitePackageEnv = `${appdataDir}\\Python\\Python310\\site-packages`
    const scriptEnv = `${appdataDir}\\Python\\Python310\\Scripts`

    try {
      if (
        !(await requirements.checkEnvironmentVariable('PATH', sitePackageEnv))
      ) {
        if (process.platform === 'win32') {
          await execa(
            `[Environment]::SetEnvironmentVariable('PATH', "${sitePackageEnv};${
              process.env.PATH ?? ''
            }",'User')`,
            [],
            { shell: 'powershell.exe' }
          )
        }
      }

      if (!(await requirements.checkEnvironmentVariable('PATH', scriptEnv))) {
        if (process.platform === 'win32') {
          await execa(
            `[Environment]::SetEnvironmentVariable('PATH', "${scriptEnv};${
              process.env.PATH ?? ''
            }",'User')`,
            [],
            { shell: 'powershell.exe' }
          )
        }
      }
    } catch (error: any) {
      throw new LogError({
        message: 'Impossible to register Pipenv environment variables',
        logFileMessage: error.toString()
      })
    }
  }
}

export const pipenv = new Pipenv()
