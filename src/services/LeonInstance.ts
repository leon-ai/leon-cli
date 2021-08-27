import execa from 'execa'
import getStream from 'get-stream'
import ora from 'ora'

import { prompt } from '../services/Prompt'
import { requirements } from '../services/Requirements'
import { pyenv } from './Pyenv'
import { pipenv } from '../services/Pipenv'
import { Config } from './Config'
import { LogError } from '../utils/LogError'

export type InstanceType = 'classic' | 'docker'

export interface RunNpmScriptOptions {
  workingDirectory: string
  loader: {
    message: string
    stderr: string
  }
  command: string
}

export interface CreateOptions {
  name: string
  path: string
  mode: InstanceType
  yes: boolean
  shouldBuild?: boolean
}

export interface LeonInstanceOptions
  extends Omit<CreateOptions, 'shouldBuild' | 'yes'> {
  birthDate: string
}

export class LeonInstance implements LeonInstanceOptions {
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
    const npmStartStream = execa('npm', ['run', 'start'], {
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

  public async runNpmScript(options: RunNpmScriptOptions): Promise<void> {
    const { command, loader, workingDirectory } = options
    process.chdir(workingDirectory)
    const npmRunLoader = ora(loader.message).start()
    try {
      const npmRunStream = execa('npm', ['run', command]).stdout
      if (npmRunStream == null) {
        return
      }
      npmRunStream.pipe(process.stdout)
      const value = await getStream(npmRunStream)
      console.log(value)
      npmRunLoader.succeed()
    } catch (error: any) {
      npmRunLoader.fail()
      throw new LogError({
        message: loader.stderr,
        logFileMessage: error.toString()
      })
    }
  }

  public async check(): Promise<void> {
    await this.runNpmScript({
      command: this.mode === 'docker' ? 'docker:check' : 'check',
      loader: {
        message: 'Checking that the setup went well',
        stderr: 'Could not check the setup'
      },
      workingDirectory: this.path
    })
  }

  public async buildDockerImage(): Promise<void> {
    await this.runNpmScript({
      command: 'docker:build',
      loader: {
        message: 'Building the Leon Docker image',
        stderr: 'Could not build Leon with Docker'
      },
      workingDirectory: this.path
    })
  }

  public async getPrerequisites(yes: boolean): Promise<void> {
    const hasPython = await requirements.checkPython()
    if (!hasPython) {
      if (yes || (await prompt.shouldInstall('Python'))) {
        await pyenv.install()
      }
    }
    const hasPipenv = await requirements.checkPipenv()
    if (!hasPipenv) {
      if (yes || (await prompt.shouldInstall('Pipenv'))) {
        await pipenv.install()
      }
    }
  }

  public async build(): Promise<void> {
    await this.runNpmScript({
      command: 'build',
      loader: {
        message: 'Building Leon',
        stderr: 'Could not build Leon'
      },
      workingDirectory: this.path
    })
  }

  public async install(): Promise<void> {
    const loader = {
      message: 'Installing npm dependencies',
      stderr: 'Could not install the npm dependencies'
    }
    process.chdir(this.path)
    const npmRunLoader = ora(loader.message).start()
    try {
      const npmRunStream = execa('npm', ['install']).stdout
      if (npmRunStream == null) {
        return
      }
      npmRunStream.pipe(process.stdout)
      const value = await getStream(npmRunStream)
      console.log(value)
      npmRunLoader.succeed()
    } catch (error: any) {
      npmRunLoader.fail()
      throw new LogError({
        message: loader.stderr,
        logFileMessage: error.toString()
      })
    }
  }

  static find(config: Config, name: string): LeonInstance | undefined {
    return config.data.instances.find((instance) => {
      return instance.name === name
    })
  }

  static async get(name?: string): Promise<LeonInstance> {
    const config = await Config.get()
    const isEmptyInstances = config.data.instances.length === 0
    if (isEmptyInstances) {
      throw new LogError({
        message: 'You should have at least one instance.'
      })
    }
    if (name == null) {
      return config.data.instances[0]
    }
    const leonInstance = LeonInstance.find(config, name)
    if (leonInstance == null) {
      throw new LogError({
        message: "This instance doesn't exists, please provider another name."
      })
    }
    return leonInstance
  }

  static async create(options: CreateOptions): Promise<void> {
    const { shouldBuild = true, yes } = options
    const config = await Config.get()
    let leonInstance = LeonInstance.find(config, options.name)
    if (leonInstance != null) {
      throw new LogError({
        message: 'This instance name already exists, please choose another name'
      })
    }
    leonInstance = new LeonInstance({
      name: options.name,
      path: options.path,
      mode: options.mode,
      birthDate: new Date().toISOString()
    })
    config.data.instances.push(leonInstance)
    await config.save()
    if (shouldBuild) {
      if (leonInstance.mode === 'docker') {
        return await leonInstance.buildDockerImage()
      }
      await leonInstance.getPrerequisites(yes)
      await leonInstance.install()
      await leonInstance.build()
    }
  }
}
