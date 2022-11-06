import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'

import ora from 'ora'
import simpleGit, { CheckRepoActions } from 'simple-git'
import { readPackage } from 'read-pkg'

import { isExistingPath } from '../utils/isExistingPath.js'
import { LeonInstance } from './LeonInstance.js'
import { LogError } from '../utils/LogError.js'
import { Requirements } from './Requirements.js'
import { config } from './Config.js'

export interface LeonOptions {
  useDevelopGitBranch?: boolean
  birthPath?: string
  version?: string
  useDocker?: boolean
  name?: string
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

  constructor(options: LeonOptions) {
    const {
      useDevelopGitBranch = false,
      birthPath,
      version,
      useDocker = false,
      name = crypto.randomUUID()
    } = options
    this.useDevelopGitBranch = useDevelopGitBranch
    this.birthPath =
      birthPath != null ? path.resolve(birthPath) : Leon.DEFAULT_BIRTH_PATH
    this.version = version
    this.useDocker = useDocker
    this.name = name
  }

  public async manageGit(): Promise<void> {
    const git = simpleGit({ baseDir: this.birthPath })
    if (!(await git.checkIsRepo(CheckRepoActions.IS_REPO_ROOT))) {
      throw new LogError({
        message: `Leon source code is not a git repository.`
      })
    }
    await git.reset(['--hard'])
    if (this.useDevelopGitBranch) {
      await git.checkout('develop')
    } else if (this.version != null) {
      await git.checkout(this.version)
    } else {
      await git.checkout('master')
    }
    await git.pull()
  }

  public async createBirth(): Promise<void> {
    let cwdIsLeonCore = false
    const cwdPath = process.cwd()
    const cwdPackageJSONPath = path.join(cwdPath, 'package.json')
    if (
      this.birthPath === Leon.DEFAULT_BIRTH_PATH &&
      this.version == null &&
      !this.useDevelopGitBranch &&
      (await isExistingPath(cwdPackageJSONPath))
    ) {
      const cwdPackageJSON = await readPackage({
        cwd: cwdPath,
        normalize: false
      })
      cwdIsLeonCore =
        cwdPackageJSON?.name === 'leon' &&
        cwdPackageJSON?.homepage === 'https://getleon.ai'
      if (cwdIsLeonCore) {
        this.birthPath = cwdPath
      }
    } else if (await isExistingPath(this.birthPath)) {
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
    if (!cwdIsLeonCore) {
      const requirements = Requirements.getInstance()
      const loader = ora(`Downloading Leon source code`).start()
      try {
        const hasGitInstalled = await requirements.checkGit()
        if (!hasGitInstalled) {
          loader.fail()
          throw new LogError({
            message: `Git is not installed, please install it before using Leon.`
          })
        }
        await simpleGit().clone(Leon.GITHUB_URL, this.birthPath)
        await this.manageGit()
        loader.succeed()
      } catch (error: any) {
        loader.fail()
        throw new LogError({
          message: `Could not download Leon source code`,
          logFileMessage: error.toString()
        })
      }
    }
    const leonInstance = await LeonInstance.create({
      name: this.name,
      path: this.birthPath,
      mode
    })
    await leonInstance.configure()
  }
}
