import { execa } from 'execa'

import { LogError } from './LogError.js'

async function getWindowsUserPath(): Promise<string> {
  const errorMessage = 'Could not retrieve user path from windows'

  try {
    const { stdout: userPath, failed } = await execa(
      `[Environment]::GetEnvironmentVariable('PATH', 'User')`,
      [],
      {
        shell: 'powershell.exe'
      }
    )
    if (failed) {
      throw new LogError({ message: errorMessage })
    }
    return userPath
  } catch (error: any) {
    throw new LogError({
      message: errorMessage,
      logFileMessage: error
    })
  }
}

async function addToPathOnWindows(pathToAdd: string): Promise<void> {
  const path = await getWindowsUserPath()
  if (path === '') {
    return
  }

  const separator =
    path.length > 0 && path.charAt(path.length - 1) !== ';' ? ';' : ''
  await execa(
    `[Environment]::SetEnvironmentVariable('PATH', "${path}${separator}${pathToAdd};",'User')`,
    [],
    { shell: 'powershell.exe' }
  )
  process.env.PATH = `${process.env.PATH ?? ''}${separator}${pathToAdd};`
}

async function addToPath(pathToAdd: string): Promise<void> {
  if (process.platform === 'win32') {
    await addToPathOnWindows(pathToAdd)
  } else {
    throw new LogError({
      message: 'OS not supported : ' + process.platform
    })
  }
}

async function saveEnvironmentVariable(
  variable: string,
  value: string
): Promise<void> {
  try {
    await execa(
      `[Environment]::SetEnvironmentVariable('${variable}', '${value}','User')`,
      [],
      { shell: 'powershell.exe' }
    )
  } catch (error: any) {
    throw new LogError({
      message: `Could not save the following environment variable "${variable}" with the value "${value}"`,
      logFileMessage: error
    })
  }
}

export { addToPath, saveEnvironmentVariable }
