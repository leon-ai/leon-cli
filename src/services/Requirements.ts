import execa from 'execa'
import semver from 'semver'

class Requirements {
  public async checkVersion(
    version: string,
    requirement: string
  ): Promise<boolean> {
    if (requirement.match(/(\d+\.)(\d+\.)?(\*|\d+)/g) === null) {
      return false
    }
    const match = version.match(/(\d+\.)(\d+\.)?(\*|\d+)/g)
    if (match === null || match.length === 0) {
      return false
    }
    return semver.gte(match[0], requirement)
  }

  public async checkPython(): Promise<boolean> {
    try {
      const { stdout } = await execa('python --version')
      return await this.checkVersion(stdout, '3.0.0')
    } catch {
      return false
    }
  }

  public async checkPyenv(): Promise<boolean> {
    try {
      const { stdout } = await execa('pyenv --version')
      return await this.checkVersion(stdout, '0.0.0')
    } catch {
      return false
    }
  }

  public async checkPipenv(): Promise<boolean> {
    try {
      const { stdout } = await execa('pipenv --version')
      return await this.checkVersion(stdout, '2019.0.0')
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
