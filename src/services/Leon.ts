import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import crypto from 'node:crypto'

import axios from 'axios'
import ora from 'ora'
import extractZip from 'extract-zip'
import simpleGit from 'simple-git'

import {
  createTemporaryEmptyFolder,
  TEMPORARY_PATH
} from '../utils/createTemporaryEmptyFolder.js'
import { isExistingFile } from '../utils/isExistingFile.js'
import { LeonInstance } from './LeonInstance.js'
import { LogError } from '../utils/LogError.js'
import { copyDirectory } from '../utils/copyDirectory.js'
import { requirements } from './Requirements.js'
import { config } from './Config.js'

export interface LeonOptions {
  useDevelopGitBranch?: boolean
  birthPath?: string
  version?: string
  useDocker?: boolean
  name?: string
  yes?: boolean
}

export class Leon implements LeonOptions {
  static readonly NAME = 'leon'
  static readonly ORGANIZATION_NAME = 'leon-ai'
  static readonly GITHUB_URL = `https://github.com/${Leon.ORGANIZATION_NAME}/${Leon.NAME}`
  static readonly DEFAULT_BIRTH_PATH = path.join(os.homedir(), '.leon')

  public useDevelopGitBranch: boolean
  public birthPath: string
  public version?: string
  public useDocker: boolean
  public name: string
  public yes: boolean

  constructor(options: LeonOptions) {
    const {
      useDevelopGitBranch = false,
      birthPath,
      version,
      useDocker = false,
      name = crypto.randomUUID(),
      yes = false
    } = options
    this.useDevelopGitBranch = useDevelopGitBranch
    this.birthPath =
      birthPath != null ? path.resolve(birthPath) : Leon.DEFAULT_BIRTH_PATH
    this.version = version
    this.useDocker = useDocker
    this.name = name
    this.yes = yes
  }

  public async downloadSourceCode(
    source: string,
    destination: string
  ): Promise<void> {
    const body = await axios.get(source, {
      responseType: 'arraybuffer'
    })
    await fs.promises.writeFile(destination, Buffer.from(body.data), {
      encoding: 'binary'
    })
  }

  public async extractZip(source: string, target: string): Promise<void> {
    const extractLoader = ora('Extracting Leon').start()
    try {
      await extractZip(source, { dir: target })
      extractLoader.succeed()
    } catch (error: any) {
      extractLoader.fail()
      throw new LogError({
        message: `Could not extract Leon source code located at ${source}`,
        logFileMessage: error.toString()
      })
    }
  }

  public getSourceCodeInformation(): {
    url: string
    zipName: string
    folderName: string
  } {
    let url = `${Leon.GITHUB_URL}/archive`
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

  public async getSourceCode(): Promise<void> {
    const loader = ora(`Downloading Leon`).start()
    try {
      const hasGitInstalled = await requirements.checkGit()
      if (hasGitInstalled) {
        const git = simpleGit()
        await git.clone(Leon.GITHUB_URL, this.birthPath)
        process.chdir(this.birthPath)
        if (this.useDevelopGitBranch) {
          await git.checkout('develop')
        } else if (this.version != null) {
          await git.checkout(this.version)
        } else {
          await git.checkout('master')
        }
      } else {
        await this.download()
      }
      loader.succeed()
    } catch (error: any) {
      loader.fail()
      throw new LogError({
        message: `Could not download Leon source code`,
        logFileMessage: error.toString()
      })
    }
  }

  public async download(): Promise<void> {
    const sourceCodeInformation = this.getSourceCodeInformation()
    const destination = path.join(TEMPORARY_PATH, sourceCodeInformation.zipName)
    const extractedPath = path.join(
      TEMPORARY_PATH,
      sourceCodeInformation.folderName
    )
    await createTemporaryEmptyFolder()
    await this.downloadSourceCode(sourceCodeInformation.url, destination)
    await this.extractZip(destination, TEMPORARY_PATH)
    await fs.promises.mkdir(this.birthPath, { recursive: true })
    await copyDirectory(extractedPath, this.birthPath)
  }

  public async createBirth(): Promise<void> {
    if (await isExistingFile(this.birthPath)) {
      throw new LogError({
        message: `${this.birthPath} already exists, please provide another path.`
      })
    }
    const instances = config.get('instances', [])
    const instance = instances.find((instance) => {
      return instance.name === this.name
    })
    const isExistingInstance = instance != null
    if (isExistingInstance) {
      throw new LogError({
        message: `${this.name} already exists, please provide another instance name.`
      })
    }
    const mode = this.useDocker ? 'docker' : 'classic'
    if (mode === 'classic') {
      await requirements.install(this.yes)
    }
    await this.getSourceCode()
    const leonInstance = LeonInstance.create({
      name: this.name,
      path: this.birthPath,
      mode
    })
    await leonInstance.configure()
  }
}
