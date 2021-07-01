import fs from 'fs'
import path from 'path'

import chalk from 'chalk'

import { isExistingFile } from '../utils/isExistingFile'
import { Leon } from './Leon'

interface LogErrorOptions {
  commandPath?: string
  stderr: string
}

class Log {
  public path = path.join(__dirname, '..', '..', 'logs')
  public errorPath = path.join(this.path, 'errors.log')

  public async error (options: LogErrorOptions): Promise<void> {
    const { commandPath: command, stderr } = options
    console.error(`${chalk.red('Error')}: ${stderr}`)
    console.error(
      `For further informations, look at the log file located at ${this.errorPath}`
    )
    const dateString = `[${new Date().toString()}]`
    const commandString = command != null ? `[${Leon.NAME} ${command}]` : ''
    const data = `${dateString} ${commandString} ${stderr}\n\n`
    if (await isExistingFile(this.errorPath)) {
      await fs.promises.appendFile(this.errorPath, data)
    } else {
      await fs.promises.writeFile(this.errorPath, data, { flag: 'w' })
    }
    process.exit(1)
  }
}

export const log = new Log()
