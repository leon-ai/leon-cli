import * as fsWithCallbacks from 'fs'
import path from 'path'

import { isExistingFile } from '../utils/isExistingFile'
import { LeonInstance } from './LeonInstance'

const fs = fsWithCallbacks.promises

export interface ConfigOptions {
  data: ConfigData
}

export interface ConfigData {
  instances: LeonInstance[]
}

export class Config implements ConfigOptions {
  static FOLDER_PATH = path.join(__dirname, '..', '..', 'config')
  static PATH = path.join(Config.FOLDER_PATH, 'config.json')

  public data: ConfigData

  private constructor (options: ConfigOptions) {
    const { data } = options
    this.data = data
  }

  static async get (): Promise<Config> {
    if (await isExistingFile(Config.PATH)) {
      const rawConfigData = await fs.readFile(Config.PATH, {
        encoding: 'utf8'
      })
      const data: ConfigData = JSON.parse(rawConfigData)
      data.instances = data.instances.map((instance) => {
        return new LeonInstance(instance)
      })
      return new Config({ data })
    }
    const configOptions: ConfigOptions = {
      data: {
        instances: []
      }
    }
    await fs.writeFile(
      Config.PATH,
      JSON.stringify(configOptions.data, null, 2),
      {
        flag: 'w'
      }
    )
    return new Config(configOptions)
  }

  public async save (): Promise<void> {
    await fs.writeFile(Config.PATH, JSON.stringify(this.data, null, 2), {
      flag: 'w'
    })
  }
}
