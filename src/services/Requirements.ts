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
  static readonly PYTHON_VERSION = '3.9.10'
  static readonly PIPENV_VERSION = '2020.11.15'
  static readonly PACKAGE_MANAGERS = [
    'apk',
    'apt',
    'brew',
    'dnf',
    'pacman',
    'yum'
  ]
  static readonly UNSUPPORTED_PACKAGE_MANAGER_MESSAGE = `Your package manager is not supported.\nSupported: ${Requirements.PACKAGE_MANAGERS.join(
    ', '
  )}.`
  static readonly UNSUPPORTED_OS_MESSAGE = `Your OS (Operating System) is not supported.\nSupported OSes: GNU/Linux, macOS and Windows.`

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
      return semver.eq(actualVersion, Requirements.PYTHON_VERSION)
    } catch {
      return false
    }
  }

  public async checkPipenv(): Promise<boolean> {
    try {
      const { stdout } = await execaCommand('pipenv --version')
      const [, , actualVersion] = stdout.split(' ')
      return this.checkVersion(actualVersion, Requirements.PIPENV_VERSION)
    } catch {
      return false
    }
  }

  public async checkSoftware(software: string): Promise<boolean> {
    try {
      const { exitCode } = await execaCommand(`${software} --version`)
      const EXIT_CODE_SUCCESS = 0
      return exitCode === EXIT_CODE_SUCCESS
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
    for (const manager of Requirements.PACKAGE_MANAGERS) {
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
      throw new LogError({
        message: Requirements.UNSUPPORTED_PACKAGE_MANAGER_MESSAGE
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
    const pythonVersionString = `Python v${Requirements.PYTHON_VERSION}`
    if (!hasPython) {
      if (
        (interactive && (await prompt.shouldInstall(pythonVersionString))) ||
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
            message: Requirements.UNSUPPORTED_OS_MESSAGE
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
            message: Requirements.UNSUPPORTED_OS_MESSAGE
          })
        }
      }
    }
  }
}
