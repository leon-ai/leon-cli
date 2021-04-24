import * as fsWithCallbacks from 'fs'
import path from 'path'

import { isExistingFile } from '../utils/isExistingFile'

const fs = fsWithCallbacks.promises

class Log {
  public path = path.join(__dirname, '..', '..', 'logs', 'errors.log')

  async error (value: string): Promise<void> {
    console.error('For further informations, look at the log file')
    const data = `[${new Date().toString()}] ${value}`
    if (await isExistingFile(this.path)) {
      return await fs.appendFile(this.path, `\n${data}`)
    }
    return await fs.writeFile(this.path, data, { flag: 'w' })
  }
}

export const log = new Log()
