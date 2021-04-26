import * as fsWithCallbacks from 'fs'
import path from 'path'

import { isExistingFile } from '../utils/isExistingFile'

const fs = fsWithCallbacks.promises

class Log {
  public path = path.join(__dirname, '..', '..', 'logs', 'errors.log')
  public errorPath = path.join(this.path, 'errors.log')

  public async error (value: string): Promise<void> {
    console.error(
      `For further informations, look at the log file located at ${this.errorPath}`
    )
    const data = `[${new Date().toString()}] ${value}`
    if (await isExistingFile(this.errorPath)) {
      return await fs.appendFile(this.errorPath, data)
    }
    return await fs.writeFile(this.errorPath, `${data}\n`, { flag: 'w' })
  }
}

export const log = new Log()
