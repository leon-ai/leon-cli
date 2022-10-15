import { execaCommand } from 'execa'

/**
 * Requirements Singleton Class.
 */
export class Requirements {
  private static instance: Requirements

  private constructor() {}

  public static getInstance(): Requirements {
    if (Requirements.instance == null) {
      Requirements.instance = new Requirements()
    }
    return Requirements.instance
  }

  public async checkSoftware(software: string): Promise<boolean> {
    try {
      const { exitCode } = await execaCommand(`${software} --version`)
      const EXIT_CODE_SUCCESS = 0
      return exitCode === EXIT_CODE_SUCCESS
    } catch {
      return false
    }
  }

  public async checkGit(): Promise<boolean> {
    return await this.checkSoftware('git')
  }
}
