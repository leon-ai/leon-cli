import * as fsWithCallbacks from 'fs'

const fs = fsWithCallbacks.promises

export const isExistingFile = async (path: string): Promise<boolean> => {
  try {
    await fs.access(path, fsWithCallbacks.constants.F_OK)
    return true
  } catch {
    return false
  }
}
