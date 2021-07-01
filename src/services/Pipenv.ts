import execa from 'execa'
import ora from 'ora'

import { checkEnvironmentVariable } from './Requirements'

export async function installPipenv (): Promise<void> {
  const pipenvLoader = ora('Installing pipenv').start()
  try {
    await execa('pip install --user pipenv')
    pipenvLoader.succeed()
  } catch (error) {
    pipenvLoader.fail()
    throw new Error(`Could not install pipenv\n${error.toString() as string}`)
  }
}

export async function setPipenvPath (): Promise<void> {
  const appdataDir = process.env.APPDATA ??
    (process.platform === 'darwin'
      ? process.env.HOME ?? '' + '/Library/Preferences' : process.env.HOME ?? '' + '/.local/share')
  const sitePackageEnv = `${appdataDir}\\Python\\Python39\\site-packages`
  const scriptEnv = `${appdataDir}\\Python\\Python39\\Scripts`

  try {
    if (!await checkEnvironmentVariable('PATH', sitePackageEnv)) {
      if (process.platform === 'win32') {
        await execa(`[Environment]::SetEnvironmentVariable('PATH', "${sitePackageEnv};${process.env.PATH ?? ''}",'User')`, [], { shell: 'powershell.exe' })
      }
    }

    if (!await checkEnvironmentVariable('PATH', scriptEnv)) {
      if (process.platform === 'win32') {
        await execa(`[Environment]::SetEnvironmentVariable('PATH', "${scriptEnv};${process.env.PATH ?? ''}",'User')`, [], { shell: 'powershell.exe' })
      }
    }
  } catch (error) {
    throw new Error(`Impossible to register Pipenv environment variables\n${error.toString() as string}`)
  }
}
