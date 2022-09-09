import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { execaCommand } from 'execa'
import semver from 'semver'
import ora from 'ora'

import { LogError } from '../utils/LogError.js'
import { sudoExec } from '../utils/sudoExec.js'
import { Prompt } from './Prompt.js'
import { PyenvWindows } from './Windows/PyenvWindows.js'
import { PipenvWindows } from './Windows/PipenvWindows.js'
import { isGNULinux, isMacOS, isWindows } from '../utils/operatingSystem.js'

const UNSUPPORTED_OS_MESSAGE = `Your OS (Operating System) is not supported.\nSupported OSes: GNU/Linux, macOS and Windows.`

export interface ExecuteScriptOptions {
  loader: {
    message: string
    stderr: string
  }
  scriptCommand: string[]
  sudo?: boolean
}

/**
 * Requirements Singleton Class.
 */
export class Requirements {
  private static instance: Requirements

  private constructor() {}

  public static getInstance(): Requirements {
    if (Requirements.instance == null) {
      Requirements.instance = new Requirements()
    }
    return Requirements.instance
  }

  public checkIfEnvironmentVariableContains(
    variable: string,
    content: string
  ): boolean {
    const environmentVariable = process.env[variable]
    if (environmentVariable === undefined || environmentVariable === '') {
      return false
    }
    return environmentVariable.includes(content)
  }

  public checkVersion(version: string, requirement: string): boolean {
    try {
      return semver.gte(version, requirement)
    } catch {
      return false
    }
  }

  public async checkPython(): Promise<boolean> {
    try {
      const { stdout } = await execaCommand('python --version')
      const [, actualVersion] = stdout.split(' ')
      return semver.eq(actualVersion, '3.9.10')
    } catch {
      return false
    }
  }

  public async checkPipenv(): Promise<boolean> {
    try {
      const { stdout } = await execaCommand('pipenv --version')
      const [, , actualVersion] = stdout.split(' ')
      return this.checkVersion(actualVersion, '2020.11.15')
    } catch {
      return false
    }
  }

  public async checkSoftware(software: string): Promise<boolean> {
    try {
      const { exitCode } = await execaCommand(`${software} --version`)
      return exitCode === 0
    } catch {
      return false
    }
  }

  public async checkGit(): Promise<boolean> {
    return await this.checkSoftware('git')
  }

  public async executeScript(options: ExecuteScriptOptions): Promise<void> {
    const { scriptCommand, loader, sudo = false } = options
    const scriptLoader = ora(loader.message).start()
    const scriptsUrl = new URL('../../scripts', import.meta.url)
    const scriptsPath = fileURLToPath(scriptsUrl)
    const commandPath = path.join(scriptsPath, ...scriptCommand)
    try {
      if (sudo && !isMacOS) {
        try {
          await sudoExec(commandPath)
        } catch {
          await execaCommand(`sudo --non-interactive ${commandPath}`)
        }
      } else {
        await execaCommand(commandPath)
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
    const packageManagers = ['apk', 'apt', 'brew', 'dnf', 'pacman', 'yum']
    for (const manager of packageManagers) {
      if (await this.checkSoftware(manager)) {
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

  public async installPythonOnUnix(scriptToExecute: string): Promise<void> {
    const loader = {
      message: 'Installing Python',
      stderr: 'Failed to install Python'
    }
    await this.installPackages()
    await this.executeScript({
      scriptCommand: [scriptToExecute],
      loader
    })
  }

  public async install(interactive: boolean): Promise<void> {
    const prompt = Prompt.getInstance()
    const hasPython = await this.checkPython()
    const hasPipenv = await this.checkPipenv()
    const hasPyenv = await this.checkSoftware('pyenv')
    let shouldInstallPipenvAfterPython = true
    if (!hasPython) {
      if (
        (interactive && (await prompt.shouldInstall('Python v3.9.10'))) ||
        !interactive
      ) {
        if (isGNULinux || isMacOS) {
          if (hasPyenv) {
            await this.installPythonOnUnix(
              'install_python_pipenv_with_pyenv.sh'
            )
          } else {
            await this.installPythonOnUnix(
              isMacOS ? 'install_pyenv_macos.sh' : 'install_pyenv.sh'
            )
            shouldInstallPipenvAfterPython = false
          }
        } else if (isWindows) {
          const pyenvWindows = PyenvWindows.getInstance()
          await pyenvWindows.install()
        } else {
          throw new LogError({
            message: UNSUPPORTED_OS_MESSAGE,
            logFileMessage: UNSUPPORTED_OS_MESSAGE
          })
        }
      }
    }
    if (!hasPipenv && shouldInstallPipenvAfterPython) {
      if (
        (interactive && (await prompt.shouldInstall('Pipenv'))) ||
        !interactive
      ) {
        const loader = {
          message: 'Installing Pipenv',
          stderr: 'Failed to install Pipenv'
        }
        if (isGNULinux || isMacOS) {
          await this.executeScript({
            scriptCommand: ['install_pipenv.sh'],
            loader
          })
        } else if (isWindows) {
          const pipenvWindows = PipenvWindows.getInstance()
          await pipenvWindows.install()
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
