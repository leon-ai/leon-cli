import * as fsWithCallbacks from 'fs'
import path from 'path'

import chalk from 'chalk'

import { isExistingFile } from '../utils/isExistingFile'
import { Leon } from './Leon'

const fs = fsWithCallbacks.promises

interface LogErrorOptions {
  value?: string
  commandPath?: string
  stderr: string
}

class Log {
  public path = path.join(__dirname, '..', '..', 'logs')
  public errorPath = path.join(this.path, 'errors.log')

  public async error (options: LogErrorOptions): Promise<void> {
    const { value = '', commandPath: command, stderr } = options
    console.error(`${chalk.red('Error')}: ${stderr}`)
    console.error(
      `For further informations, look at the log file located at ${this.errorPath}`
    )
    const dateString = `[${new Date().toString()}]`
    const commandString = command != null ? `[${Leon.NAME} ${command}]` : ''
    const data = `${dateString} ${commandString} ${stderr}\n${value}\n\n`
    if (await isExistingFile(this.errorPath)) {
      await fs.appendFile(this.errorPath, data)
    } else {
      await fs.writeFile(this.errorPath, data, { flag: 'w' })
    }
    process.exit(1)
  }
}

export const log = new Log()
