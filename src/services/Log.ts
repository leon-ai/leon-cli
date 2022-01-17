import fs from 'node:fs'
import path from 'node:path'

import chalk from 'chalk'

import { isExistingFile } from '../utils/isExistingFile'
import { Leon } from './Leon'
import { LogError } from '../utils/LogError'

interface LogErrorOptions {
  commandPath?: string
  error: unknown
}

class Log {
  public path = path.join(__dirname, '..', '..', 'logs')
  public ERROR_LOG_PATH = path.join(this.path, 'errors.log')

  public async error(options: LogErrorOptions): Promise<void> {
    const { commandPath, error } = options
    const message = error instanceof Error ? error.message : 'Fatal'
    console.error(`${chalk.red('Error')}: ${message}`)
    if (error instanceof LogError) {
      const logFileMessage = error.logFileMessage ?? ''
      const dateString = `[${new Date().toString()}]`
      const commandString =
        commandPath != null ? `[${Leon.NAME} ${commandPath}]` : ''
      const data = `${dateString} ${commandString} ${error.message}\n${logFileMessage}\n\n`
      if (process.env.NODE_ENV === 'test-e2e') {
        console.error(chalk.bold('logs/errors.log:\n'))
        console.log(data)
      } else {
        console.error(
          `For further information, look at the log file located at ${this.ERROR_LOG_PATH}`
        )
        if (await isExistingFile(this.ERROR_LOG_PATH)) {
          await fs.promises.appendFile(this.ERROR_LOG_PATH, data)
        } else {
          await fs.promises.writeFile(this.ERROR_LOG_PATH, data, { flag: 'w' })
        }
      }
    }
  }
}

export const log = new Log()
