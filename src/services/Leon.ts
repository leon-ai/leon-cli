import path from 'path'
import * as fsWithCallbacks from 'fs'

import axios from 'axios'
import ora from 'ora'
import extractZip from 'extract-zip'
import { temporary } from './Temporary'

const fs = fsWithCallbacks.promises

export interface LeonOptions {
  useDevelopGitBranch: boolean
  birthPath: string
}

export class Leon implements LeonOptions {
  static NAME = 'leon'
  static ORGANIZATION_NAME = 'leon-ai'
  static LEON_GITHUB_URL = `https://github.com/${Leon.ORGANIZATION_NAME}/${Leon.NAME}`

  public useDevelopGitBranch: boolean
  public birthPath: string

  constructor (options: LeonOptions) {
    this.useDevelopGitBranch = options.useDevelopGitBranch
    this.birthPath = options.birthPath
  }

  private async downloadSourceCode (destination: string, gitBranch: string): Promise<void> {
    const downloadLoader = ora(`Downloading Leon from the ${gitBranch} git branch`).start()
    const leonSourceCodeURL = `${Leon.LEON_GITHUB_URL}/archive/${gitBranch}.zip`
    try {
      const body = await axios.get(leonSourceCodeURL, {
        responseType: 'arraybuffer'
      })
      await fs.writeFile(destination, Buffer.from(body.data), {
        encoding: 'binary'
      })
      downloadLoader.succeed()
    } catch (error) {
      downloadLoader.fail()
      throw new Error(
        `Could not download Leon source code located at ${leonSourceCodeURL} - ${
          error.message as string
        }`
      )
    }
  }

  private async extractZip (source: string, target: string): Promise<void> {
    const extractLoader = ora('Extracting Leon').start()
    await extractZip(source, { dir: target })
    extractLoader.succeed()
  }

  public async install (): Promise<void> {
    const gitBranch = this.useDevelopGitBranch ? 'develop' : 'master'
    const destination = path.join(temporary.PATH, `${Leon.NAME}.zip`)
    const extractedPath = path.join(temporary.PATH, `${Leon.NAME}-${gitBranch}`)
    await temporary.createEmptyFolder()
    await this.downloadSourceCode(destination, gitBranch)
    await this.extractZip(destination, temporary.PATH)
    await fs.rename(extractedPath, this.birthPath)
  }
}
