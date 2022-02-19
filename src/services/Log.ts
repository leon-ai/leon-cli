import Conf from 'conf'
import chalk from 'chalk'

import { LogError } from '../utils/LogError.js'
import { Leon } from './Leon.js'

interface LogErrorOptions {
  commandPath?: string
  error: unknown
}

export class Log {
  static errorsConfig = new Conf({
    configName: 'log-errors',
    projectSuffix: '',
    fileExtension: 'txt',
    serialize: (value) => {
      return value.errors as string
    },
    deserialize: (value) => {
      return { errors: value }
    }
  })

  public error(options: LogErrorOptions): void {
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
          `For further information, look at the log file located at ${Log.errorsConfig.path}`
        )
        Log.errorsConfig.set('errors', data)
      }
    }
  }
}

export const log = new Log()
