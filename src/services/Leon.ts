import path from 'path'
import os from 'os'
import * as fsWithCallbacks from 'fs'

import axios from 'axios'
import ora from 'ora'
import extractZip from 'extract-zip'
import {
  createTemporaryEmptyFolder,
  TEMPORARY_PATH
} from '../utils/createTemporaryEmptyFolder'

const fs = fsWithCallbacks.promises

export interface LeonOptions {
  useDevelopGitBranch?: boolean
  birthPath?: string
  version?: string
}

export class Leon implements LeonOptions {
  static NAME = 'leon'
  static ORGANIZATION_NAME = 'leon-ai'
  static LEON_GITHUB_URL = `https://github.com/${Leon.ORGANIZATION_NAME}/${Leon.NAME}`

  public useDevelopGitBranch: boolean
  public birthPath: string
  public version?: string

  constructor (options: LeonOptions) {
    this.useDevelopGitBranch = options.useDevelopGitBranch ?? false
    this.birthPath = options.birthPath ?? path.join(os.homedir(), '.leon')
    this.version = options.version
  }

  public async downloadSourceCode (
    source: string,
    destination: string
  ): Promise<void> {
    const downloadLoader = ora(`Downloading Leon from ${source}`).start()
    try {
      const body = await axios.get(source, {
        responseType: 'arraybuffer'
      })
      await fs.writeFile(destination, Buffer.from(body.data), {
        encoding: 'binary'
      })
      downloadLoader.succeed()
    } catch (error) {
      downloadLoader.fail()
      throw new Error(
        `Could not download Leon source code located at ${source} - ${
          error.message as string
        }`
      )
    }
  }

  public async extractZip (source: string, target: string): Promise<void> {
    const extractLoader = ora('Extracting Leon').start()
    await extractZip(source, { dir: target })
    extractLoader.succeed()
  }

  public getSourceCodeInformation (): {
    url: string
    zipName: string
    folderName: string
  } {
    let url = `${Leon.LEON_GITHUB_URL}/archive`
    let version = this.useDevelopGitBranch ? 'develop' : 'master'
    if (this.version != null) {
      version = this.version
      url += '/refs/tags'
    }
    const folderName = `${Leon.NAME}-${version}`
    const zipName = `${version}.zip`
    return {
      url: `${url}/${zipName}`,
      zipName,
      folderName
    }
  }

  public async install (): Promise<void> {
    const sourceCodeInformation = this.getSourceCodeInformation()
    const destination = path.join(TEMPORARY_PATH, sourceCodeInformation.zipName)
    const extractedPath = path.join(
      TEMPORARY_PATH,
      sourceCodeInformation.folderName
    )
    await createTemporaryEmptyFolder()
    await this.downloadSourceCode(sourceCodeInformation.url, destination)
    await this.extractZip(destination, TEMPORARY_PATH)
    await fs.rename(extractedPath, this.birthPath)
  }
}
