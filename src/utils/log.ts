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

export const log = {
  path: `${__dirname}/../../logs/errors.log`,
  async error (value: string): Promise<void> {
    console.error('For further informations, look at the log file')
    const data = `[${new Date().toString()}] ${value}`
    if (await isExistingFile(this.path)) {
      return await fs.appendFile(this.path, `\n${data}`)
    }
    return await fs.writeFile(this.path, data, { flag: 'w' })
  }
}
