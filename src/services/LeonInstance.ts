import fs from 'node:fs'
import path from 'node:path'

import execa from 'execa'
import getStream from 'get-stream'
import ora from 'ora'

import { config } from './Config.js'
import { LogError } from '../utils/LogError.js'
import { isExistingFile } from '../utils/isExistingFile.js'

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
  startCount: number
}

export class LeonInstance implements LeonInstanceOptions {
  public name: string
  public path: string
  public mode: InstanceType
  public birthDate: string
  public startCount: number

  public constructor(options: LeonInstanceOptions) {
    const { name, path, mode, birthDate, startCount } = options
    this.name = name
    this.path = path
    this.mode = mode
    this.birthDate = birthDate
    this.startCount = startCount
  }

  public async startDocker(LEON_PORT: string): Promise<void> {
    const dockerStartStream = execa('npm', ['run', 'docker:run'], {
      env: {
        LEON_PORT
      }
    }).stdout
    if (dockerStartStream == null) {
      return
    }
    process.on('SIGINT', (async () => {
      await execa('docker-compose', ['down'])
    }) as unknown as () => void)
    dockerStartStream.pipe(process.stdout)
    const value = await getStream(dockerStartStream)
    console.log(value)
  }

  public async startClassic(LEON_PORT: string): Promise<void> {
    if (this.startCount === 0) {
      const dotenvPath = path.join(this.path, '.env')
      if (await isExistingFile(dotenvPath)) {
        await fs.promises.rm(dotenvPath)
      }
      await this.install()
    }
    const npmStartStream = execa.command('npm start', {
      env: {
        LEON_PORT
      }
    }).stdout
    if (npmStartStream == null) {
      return
    }
    npmStartStream.pipe(process.stdout)
    const value = await getStream(npmStartStream)
    console.log(value)
  }

  public async start(port?: number): Promise<void> {
    process.chdir(this.path)
    const LEON_PORT = port?.toString() ?? '1337'
    if (this.mode === 'docker') {
      return await this.startDocker(LEON_PORT)
    }
    return await this.startClassic(LEON_PORT)
  }

  public async runScript(options: RunNpmScriptOptions): Promise<void> {
    const { command, loader, workingDirectory, verbose = false } = options
    process.chdir(workingDirectory)
    const runLoader = ora(loader.message).start()
    try {
      const { stdout } = await execa.command(command)
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
    await this.runScript({
      command: 'npm run ' + (this.mode === 'docker' ? 'docker:check' : 'check'),
      verbose: true,
      loader: {
        message: 'Checking that the setup went well',
        stderr: 'Could not check the setup'
      },
      workingDirectory: this.path
    })
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

  static find(name: string): LeonInstance | null {
    const instances = config.get('instances', [])
    const instance = instances.find((instance) => {
      return instance.name === name
    })
    if (instance != null) {
      return new LeonInstance(instance)
    }
    return null
  }

  static get(name?: string): LeonInstance {
    if (name == null) {
      const instances = config.get('instances', [])
      const isEmptyInstances = instances.length === 0
      if (isEmptyInstances) {
        throw new LogError({
          message: 'You should have at least one instance.'
        })
      }
      return new LeonInstance(instances[0])
    }
    const leonInstance = LeonInstance.find(name)
    if (leonInstance == null) {
      throw new LogError({
        message: "This instance doesn't exists, please provider another name."
      })
    }
    return leonInstance
  }

  public incrementStartCount(): void {
    const leonInstance = LeonInstance.find(this.name)
    if (leonInstance == null) {
      throw new LogError({
        message: "This instance doesn't exists, please provider another name."
      })
    }
    leonInstance.startCount += 1
    const instances = config.get('instances', [])
    const instance = instances.find((instance) => {
      return instance.name === this.name
    })
    if (instance != null) {
      instance.startCount = leonInstance.startCount
      config.set('instances', instances)
    }
  }

  static async create(options: CreateOptions): Promise<void> {
    let leonInstance = LeonInstance.find(options.name)
    if (leonInstance != null) {
      throw new LogError({
        message: 'This instance name already exists, please choose another name'
      })
    }
    const instance = {
      name: options.name,
      path: options.path,
      mode: options.mode,
      birthDate: new Date().toISOString(),
      startCount: 0
    }
    leonInstance = new LeonInstance(instance)
    config.set('instances', [...config.get('instances', []), instance])
    if (leonInstance.mode === 'docker') {
      await leonInstance.buildDockerImage()
    } else {
      await leonInstance.install()
      await leonInstance.build()
    }
  }
}
