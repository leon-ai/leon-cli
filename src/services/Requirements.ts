import path from 'node:path'

import execa from 'execa'
import semver from 'semver'
import ora from 'ora'

import { LogError } from '../utils/LogError'
import { sudoExec } from '../utils/sudoExec'
import { prompt } from './Prompt'

export interface ExecuteScriptOptions {
  loader: {
    message: string
    stderr: string
  }
  scriptCommand: string[]
  sudo?: boolean
}

class Requirements {
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
      if (sudo) {
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
    await this.installPackages()
    await this.executeScript({
      scriptCommand: ['install_pyenv.sh'],
      loader: {
        message: 'Installing Python',
        stderr: 'Failed to install Python'
      }
    })
  }

  public async installPythonOnWindows(): Promise<void> {}

  public async install(yes: boolean): Promise<void> {
    const hasPython = await this.checkPython()
    if (!hasPython) {
      if (yes || (await prompt.shouldInstall('Python'))) {
        const isLinux = process.platform === 'linux'
        const isMacOS = process.platform === 'darwin'
        const isWindows = process.platform === 'win32'
        if (isLinux || isMacOS) {
          await this.installPythonOnUnix()
        } else if (isWindows) {
          await this.installPythonOnWindows()
        } else {
          const message = `Your OS (Operating System) is not supported.\nSupported OSes: Linux, macOS and Windows.`
          throw new LogError({
            message,
            logFileMessage: message
          })
        }
      }
    } else if (!(await this.checkPipenv())) {
      if (yes || (await prompt.shouldInstall('Pipenv'))) {
        await this.executeScript({
          scriptCommand: ['install_pipenv.sh'],
          loader: {
            message: 'Installing Pipenv',
            stderr: 'Failed to install Pipenv'
          }
        })
      }
    }
  }
}

export const requirements = new Requirements()
