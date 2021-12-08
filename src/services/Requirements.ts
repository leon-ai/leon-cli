import execa from 'execa'
import semver from 'semver'

class Requirements {
  public async checkVersion(
    version: string,
    requirement: string
  ): Promise<boolean> {
    try {
      return semver.gte(version, requirement)
    } catch {
      return false
    }
  }

  public async checkPython(): Promise<boolean> {
    try {
      const { stdout } = await execa.command('python --version')
      const [, actualVersion] = stdout.split(' ')
      return await this.checkVersion(actualVersion, '3.0.0')
    } catch {
      return false
    }
  }

  public async checkPyenv(): Promise<boolean> {
    try {
      const { stdout } = await execa.command('pyenv --version')
      const [, actualVersion] = stdout.split(' ')
      return await this.checkVersion(actualVersion, '0.0.0')
    } catch {
      return false
    }
  }

  public async checkPipenv(): Promise<boolean> {
    try {
      const { stdout } = await execa.command('pipenv --version')
      const [, , actualVersion] = stdout.split(' ')
      return await this.checkVersion(actualVersion, '2019.0.0')
    } catch {
      return false
    }
  }

  public async checkEnvironmentVariable(
    variable: string,
    content: string
  ): Promise<boolean> {
    const environmentVariable = process.env[variable]
    if (environmentVariable === undefined || environmentVariable === '') {
      return false
    }
    return environmentVariable.includes(content)
  }
}

export const requirements = new Requirements()
