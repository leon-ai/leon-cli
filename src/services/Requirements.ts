import execa from 'execa'
import semver from 'semver'

export async function checkVersion (version: string, requirement: string): Promise<boolean> {
  if (requirement.match(/(\d+\.)(\d+\.)?(\*|\d+)/g) === null) {
    return false
  }

  const match = version.match(/(\d+\.)(\d+\.)?(\*|\d+)/g)
  if (match === null || match.length === 0) {
    return false
  }

  return semver.gte(match[0], requirement)
}

export async function checkPython (): Promise<boolean> {
  try {
    const { stdout } = await execa('python --v')
    return await checkVersion(stdout, '3.0.0')
  } catch {
    return false
  }
}

export async function checkPyenv (): Promise<boolean> {
  try {
    const { stdout } = await execa('pyenv --v')
    return await checkVersion(stdout, '0.0.0')
  } catch {
    return false
  }
}
