import execa from 'execa'

export async function checkPython (): Promise<boolean> {
  try {
    const { stdout } = await execa('python --v')
    const version = stdout.search('(d+.)?(d+.)?(d+)')
    return version !== undefined
  } catch {
    return false
  }
}
