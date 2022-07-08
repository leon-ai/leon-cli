import os from 'node:os'

import { execa } from 'execa'

import { LogError } from './LogError.js'

export const getWindowsUserPath = async (): Promise<string> => {
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

export const addToPathOnWindows = async (pathToAdd: string): Promise<void> => {
  let path = await getWindowsUserPath()
  if (path === '') {
    return
  }

  // Windows 10 1905 or newer => We need to disable the built-in Python launcher (Microsoft Store) Execution Alias
  // Deleting "C:\Users\Username\AppData\Local\Microsoft\WindowsApps\" in the PATH, prevent the Microsoft Store application from launching (see: <https://superuser.com/a/1442909>)
  const pathToReplace = `${os.homedir()}\\AppData\\Local\\Microsoft\\WindowsApps;`
  path = path.replace(pathToReplace, '')

  const separator =
    path.length > 0 && path.charAt(path.length - 1) !== ';' ? ';' : ''
  await execa(
    `[Environment]::SetEnvironmentVariable('PATH', "${path}${separator}${pathToAdd};", 'User')`,
    [],
    { shell: 'powershell.exe' }
  )
  process.env.PATH = `${process.env.PATH ?? ''}${separator}${pathToAdd};`
}

export const addEnvironmentVariableOnWindows = async (
  variable: string,
  value: string
): Promise<void> => {
  try {
    await execa(
      `[Environment]::SetEnvironmentVariable('${variable}', '${value}', 'User')`,
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
