import path from 'node:path'

import execa from 'execa'
import semver from 'semver'
import ora from 'ora'

import { LogError } from '../utils/LogError.js'
import { sudoExec } from '../utils/sudoExec.js'
import { prompt } from './Prompt.js'
import { pyenvWindows } from './Windows/PyenvWindows.js'
import { pipenvWindows } from './Windows/PipenvWindows.js'
import { isLinux, isMacOS, isWindows } from '../utils/operatingSystem.js'

const UNSUPPORTED_OS_MESSAGE = `Your OS (Operating System) is not supported.\nSupported OSes: Linux, macOS and Windows.`

export interface ExecuteScriptOptions {
  loader: {
    message: string
    stderr: string
  }
  scriptCommand: string[]
  sudo?: boolean
}

class Requirements {
  public async checkIfEnvironmentVariableContains(
    variable: string,
    content: string
  ): Promise<boolean> {
    const environmentVariable = process.env[variable]
    if (environmentVariable === undefined || environmentVariable === '') {
      return false
    }
    return environmentVariable.includes(content)
  }

  public async checkVersion(
    version: string,
    requirement: string
  ): Promise<boolean> {
    try {
      return semver.gte(version, requirement)
    } catch {
      return false
    }
  }

  public async checkPython(): Promise<boolean> {
    try {
      const { stdout } = await execa.command('python --version')
      const [, actualVersion] = stdout.split(' ')
      return await this.checkVersion(actualVersion, '3.0.0')
    } catch {
      return false
    }
  }

  public async checkPipenv(): Promise<boolean> {
    try {
      const { stdout } = await execa.command('pipenv --version')
      const [, , actualVersion] = stdout.split(' ')
      return await this.checkVersion(actualVersion, '2020.11.15')
    } catch {
      return false
    }
  }

  public async checkPackageManager(packageManager: string): Promise<boolean> {
    try {
      const { exitCode } = await execa.command(`${packageManager} --version`)
      return exitCode === 0
    } catch {
      return false
    }
  }

  public async executeScript(options: ExecuteScriptOptions): Promise<void> {
    const { scriptCommand, loader, sudo = false } = options
    const scriptLoader = ora(loader.message).start()
    const scriptsPath = path.join(__dirname, '..', '..', 'scripts')
    const commandPath = path.join(scriptsPath, ...scriptCommand)
    try {
      if (sudo && !isMacOS) {
        await sudoExec(commandPath)
      } else {
        await execa.command(commandPath)
      }
      scriptLoader.succeed()
    } catch (error: any) {
      scriptLoader.fail()
      throw new LogError({
        message: loader.stderr,
        logFileMessage: error.toString()
      })
    }
  }

  public async installPackages(): Promise<void> {
    let packageManager: string | null = null
    const packageManagers = ['apk', 'apt', 'brew', 'pacman', 'yum']
    for (const manager of packageManagers) {
      if (await this.checkPackageManager(manager)) {
        packageManager = manager
        break
      }
    }

    if (packageManager != null) {
      await this.executeScript({
        scriptCommand: [
          'dependencies',
          `install_${packageManager}_packages.sh`
        ],
        sudo: true,
        loader: {
          message: 'Installing packages',
          stderr: 'Failed to install needed packages'
        }
      })
    } else {
      const packageManagersString = packageManagers.join(', ')
      const message = `Your package manager is not supported.\nSupported: ${packageManagersString}.`
      throw new LogError({
        message,
        logFileMessage: message
      })
    }
  }

  public async installPythonOnUnix(): Promise<void> {
    const loader = {
      message: 'Installing Python',
      stderr: 'Failed to install Python'
    }
    await this.installPackages()
    if (isMacOS) {
      await this.executeScript({
        scriptCommand: ['install_pyenv_macos.sh'],
        loader
      })
    } else {
      await this.executeScript({
        scriptCommand: ['install_pyenv.sh'],
        loader
      })
    }
  }

  public async install(yes: boolean): Promise<void> {
    const hasPython = await this.checkPython()
    const hasPipenv = await this.checkPipenv()
    if (!hasPipenv) {
      if (!hasPython) {
        if (yes || (await prompt.shouldInstall('Python'))) {
          if (isLinux || isMacOS) {
            await this.installPythonOnUnix()
          } else if (isWindows) {
            await pyenvWindows.install()
            await pipenvWindows.install()
            await pipenvWindows.addToPath()
          } else {
            throw new LogError({
              message: UNSUPPORTED_OS_MESSAGE,
              logFileMessage: UNSUPPORTED_OS_MESSAGE
            })
          }
        }
      } else {
        if (yes || (await prompt.shouldInstall('Pipenv'))) {
          const loader = {
            message: 'Installing Pipenv',
            stderr: 'Failed to install Pipenv'
          }
          if (isLinux || isMacOS) {
            await this.executeScript({
              scriptCommand: ['install_pipenv.sh'],
              loader
            })
          } else if (isWindows) {
            await pipenvWindows.install()
            await pipenvWindows.addToPath()
          } else {
            throw new LogError({
              message: UNSUPPORTED_OS_MESSAGE,
              logFileMessage: UNSUPPORTED_OS_MESSAGE
            })
          }
        }
      }
    }
  }
}

export const requirements = new Requirements()
