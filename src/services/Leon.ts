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
import { isExistingPath } from '../utils/isExistingPath.js'
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
  useGit?: boolean
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
  public useGit: boolean
  public name: string
  public yes: boolean

  constructor(options: LeonOptions) {
    const {
      useDevelopGitBranch = false,
      birthPath,
      version,
      useDocker = false,
      useGit = true,
      name = crypto.randomUUID(),
      yes = false
    } = options
    this.useDevelopGitBranch = useDevelopGitBranch
    this.birthPath =
      birthPath != null ? path.resolve(birthPath) : Leon.DEFAULT_BIRTH_PATH
    this.version = version
    this.useDocker = useDocker
    this.useGit = useGit
    this.name = name
    this.yes = yes
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

  public async getSourceCode(): Promise<string> {
    const loader = ora(`Downloading Leon source code`).start()
    try {
      await createTemporaryEmptyFolder()
      let sourceCodePath = ''
      const hasGitInstalled = await requirements.checkGit()
      if (hasGitInstalled && this.useGit) {
        sourceCodePath = path.join(TEMPORARY_PATH, 'leon-ai-git')
        await simpleGit().clone(Leon.GITHUB_URL, sourceCodePath)
        const git = simpleGit({ baseDir: sourceCodePath })
        if (this.useDevelopGitBranch) {
          await git.checkout('develop')
        } else if (this.version != null) {
          await git.checkout(this.version)
        } else {
          await git.checkout('master')
        }
      } else {
        sourceCodePath = await this.download()
      }
      loader.succeed()
      return sourceCodePath
    } catch (error: any) {
      loader.fail()
      throw new LogError({
        message: `Could not download Leon source code`,
        logFileMessage: error.toString()
      })
    }
  }

  public async download(): Promise<string> {
    const sourceCodeInformation = this.getSourceCodeInformation()
    const destination = path.join(TEMPORARY_PATH, sourceCodeInformation.zipName)
    const extractedPath = path.join(
      TEMPORARY_PATH,
      sourceCodeInformation.folderName
    )
    const { data } = await axios.get(sourceCodeInformation.url, {
      responseType: 'arraybuffer'
    })
    await fs.promises.writeFile(destination, Buffer.from(data), {
      encoding: 'binary'
    })
    await extractZip(destination, { dir: TEMPORARY_PATH })
    return extractedPath
  }

  public async transferSourceCodeFromTemporaryToBirthPath(
    sourceCodePath: string
  ): Promise<void> {
    await fs.promises.mkdir(this.birthPath, { recursive: true })
    await copyDirectory(sourceCodePath, this.birthPath)
  }

  public async createBirth(): Promise<void> {
    if (await isExistingPath(this.birthPath)) {
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
    const sourceCodePath = await this.getSourceCode()
    await this.transferSourceCodeFromTemporaryToBirthPath(sourceCodePath)
    const leonInstance = LeonInstance.create({
      name: this.name,
      path: this.birthPath,
      mode
    })
    await leonInstance.configure()
  }
}
