import fs from 'node:fs'
import path from 'node:path'

import { execa, execaCommand } from 'execa'
import ora from 'ora'
import date from 'date-and-time'
import { readPackage } from 'read-pkg'
import { table } from 'table'
import chalk from 'chalk'

import { config } from './Config.js'
import { LogError } from '../utils/LogError.js'
import { isExistingPath } from '../utils/isExistingPath.js'
import type { Leon } from './Leon.js'

export type InstanceType = 'classic' | 'docker'

export interface RunNpmScriptOptions {
  workingDirectory: string
  loader: {
    message: string
    stderr: string
  }
  command: string
  verbose?: boolean
}

export interface CreateOptions {
  name: string
  path: string
  mode: InstanceType
}

export interface LeonInstanceOptions extends CreateOptions {
  birthDate: string
}

export class LeonInstance implements LeonInstanceOptions {
  static readonly INVALID_VERSION = '0.0.0'
  static readonly DEFAULT_START_PORT = 1337

  public name: string
  public path: string
  public mode: InstanceType
  public birthDate: string

  public constructor(options: LeonInstanceOptions) {
    const { name, path, mode, birthDate } = options
    this.name = name
    this.path = path
    this.mode = mode
    this.birthDate = birthDate
  }

  public async startDocker(LEON_PORT: string): Promise<void> {
    await execa('npm', ['run', 'docker:run'], {
      env: {
        LEON_PORT
      },
      stdio: 'inherit'
    })
    process.on('SIGINT', (async () => {
      await execa('docker-compose', ['down'])
    }) as unknown as () => void)
  }

  public async startClassic(LEON_PORT: string): Promise<void> {
    await execaCommand('npm start', {
      env: {
        LEON_PORT
      },
      stdio: 'inherit'
    })
  }

  public async start(port?: number): Promise<void> {
    process.chdir(this.path)
    const LEON_PORT_STRING = port ?? LeonInstance.DEFAULT_START_PORT
    const LEON_PORT = LEON_PORT_STRING.toString()
    if (this.mode === 'docker') {
      return await this.startDocker(LEON_PORT)
    }
    return await this.startClassic(LEON_PORT)
  }

  public async runScript(options: RunNpmScriptOptions): Promise<void> {
    const { command, loader, workingDirectory, verbose = false } = options
    if (process.env.NODE_ENV === 'test') {
      console.log(`Working directory: ${workingDirectory}`)
    }
    process.chdir(workingDirectory)
    const runLoader = ora(loader.message).start()
    try {
      const { stdout } = await execaCommand(command)
      runLoader.succeed()
      if (verbose) {
        console.log(stdout)
      }
    } catch (error: any) {
      runLoader.fail()
      throw new LogError({
        message: loader.stderr,
        logFileMessage: error.toString()
      })
    }
  }

  public async check(): Promise<void> {
    process.chdir(this.path)
    const command =
      'npm run ' + (this.mode === 'docker' ? 'docker:check' : 'check')
    await execaCommand(command, { stdio: 'inherit' })
  }

  public async buildDockerImage(): Promise<void> {
    await this.runScript({
      command: 'npm run docker:build',
      loader: {
        message: 'Building the Leon Docker image',
        stderr: 'Could not build Leon with Docker'
      },
      workingDirectory: this.path
    })
  }

  public async build(): Promise<void> {
    await this.runScript({
      command: 'npm run build',
      loader: {
        message: 'Building Leon core',
        stderr: 'Could not build Leon core'
      },
      workingDirectory: this.path
    })
  }

  public async install(): Promise<void> {
    await this.runScript({
      command: 'npm install',
      workingDirectory: this.path,
      loader: {
        message: 'Installing npm dependencies',
        stderr: 'Could not install the npm dependencies'
      }
    })
  }

  static async find(name: string): Promise<LeonInstance | null> {
    const instances = config.get('instances', [])
    const instance = instances.find((instance) => {
      return instance.name === name
    })
    if (instance != null) {
      const leonInstance = new LeonInstance(instance)
      if (await isExistingPath(instance.path)) {
        return leonInstance
      }
      await leonInstance.delete()
      return null
    }
    return null
  }

  static async get(name?: string): Promise<LeonInstance> {
    let instanceName = name ?? 'default'
    const logErrorAtLeastOneInstance = new LogError({
      message: 'You should have at least one instance.'
    })
    if (name == null) {
      const instances = config.get('instances', [])
      const isEmptyInstances = instances.length === 0
      if (isEmptyInstances) {
        throw logErrorAtLeastOneInstance
      }
      const firstInstance = instances[0]
      instanceName = firstInstance.name
    }
    const leonInstance = await LeonInstance.find(instanceName)
    if (leonInstance == null) {
      if (name == null) {
        throw logErrorAtLeastOneInstance
      }
      throw new LogError({
        message: "This instance doesn't exists, please provider another name."
      })
    }
    return leonInstance
  }

  public async delete(): Promise<void> {
    const instances = config.get('instances', [])
    const instanceIndex = instances.findIndex((instance) => {
      return instance.name === this.name
    })
    if (instanceIndex != null) {
      instances.splice(instanceIndex, 1)
      config.set('instances', instances)
      await fs.promises.rm(this.path, {
        force: true,
        recursive: true
      })
    }
  }

  static async create(options: CreateOptions): Promise<LeonInstance> {
    let leonInstance = await LeonInstance.find(options.name)
    if (leonInstance != null) {
      throw new LogError({
        message: 'This instance name already exists, please choose another name'
      })
    }
    const instance = {
      name: options.name,
      path: options.path,
      mode: options.mode,
      birthDate: new Date().toISOString()
    }
    leonInstance = new LeonInstance(instance)
    config.set('instances', [...config.get('instances', []), instance])
    return leonInstance
  }

  public async configure(): Promise<void> {
    if (this.mode === 'docker') {
      await this.buildDockerImage()
    } else {
      await this.install()
      await this.build()
    }
  }

  public async update(leon: Leon): Promise<void> {
    const currentVersion = await this.getVersion()
    const sourceCodePath = await leon.getSourceCode()
    const sourceCodeVersion = await this.getVersion()
    if (currentVersion !== sourceCodeVersion || leon.useDevelopGitBranch) {
      await fs.promises.rm(this.path, {
        force: true,
        recursive: true
      })
      await leon.transferSourceCodeFromTemporaryToBirthPath(sourceCodePath)
      await this.configure()
    }
  }

  public async getVersion(): Promise<string> {
    const packageJsonPath = path.join(this.path, 'package.json')
    let version = LeonInstance.INVALID_VERSION
    if (await isExistingPath(packageJsonPath)) {
      const packageJSON = await readPackage({
        cwd: this.path,
        normalize: false
      })
      version = packageJSON.version ?? LeonInstance.INVALID_VERSION
    }
    return version
  }

  public async info(): Promise<string> {
    const birthDay = new Date(this.birthDate)
    const birthDayString = date.format(birthDay, 'DD/MM/YYYY - HH:mm:ss')
    const version = await this.getVersion()
    return table([
      [chalk.bold('Name'), this.name],
      [chalk.bold('Path'), this.path],
      [chalk.bold('Mode'), this.mode],
      [chalk.bold('Birth date'), birthDayString],
      [chalk.bold('Version'), version]
    ])
  }
}
