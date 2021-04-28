import { v4 as uuidv4 } from 'uuid'
import execa from 'execa'
import getStream from 'get-stream'

import { Config } from './Config'

export type InstanceType = 'classic' | 'docker'

export interface CreateOptions {
  name?: string
  path: string
  mode: InstanceType
}

export interface LeonInstanceOptions extends CreateOptions {
  name: string
  birthDate: string
}

export class LeonInstance implements LeonInstanceOptions {
  public name: string
  public path: string
  public mode: InstanceType
  public birthDate: string

  public constructor (options: LeonInstanceOptions) {
    const { name, path, mode, birthDate } = options
    this.name = name
    this.path = path
    this.mode = mode
    this.birthDate = birthDate
  }

  public async startDocker (LEON_PORT: string): Promise<void> {
    const dockerStartStream = execa('npm', ['run', 'docker:run'], {
      env: {
        LEON_PORT
      }
    }).stdout
    if (dockerStartStream == null) {
      return
    }
    process.on('SIGINT', ((async () => {
      await execa('docker-compose', ['down'])
    }) as unknown) as () => void)
    dockerStartStream.pipe(process.stdout)
    const value = await getStream(dockerStartStream)
    console.log(value)
  }

  public async startClassic (LEON_PORT: string): Promise<void> {
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

  public async start (port?: number): Promise<void> {
    process.chdir(this.path)
    const LEON_PORT = port?.toString() ?? '1337'
    if (this.mode === 'docker') {
      return await this.startDocker(LEON_PORT)
    }
    return await this.startClassic(LEON_PORT)
  }

  static async get (name?: string): Promise<LeonInstance> {
    const config = await Config.get()
    if (name == null && config.data.instances.length >= 1) {
      return config.data.instances[0]
    }
    throw new Error('You should have at least one instance.')
  }

  static async create (options: CreateOptions): Promise<void> {
    const config = await Config.get()
    config.data.instances.push(
      new LeonInstance({
        name: options.name ?? uuidv4(),
        path: options.path,
        mode: options.mode,
        birthDate: new Date().toISOString()
      })
    )
    await config.save()
  }
}
