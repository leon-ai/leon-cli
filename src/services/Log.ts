import Conf from 'conf'
import chalk from 'chalk'

import { LogError } from '../utils/LogError.js'
import { Leon } from './Leon.js'
import { packageJSON } from '../packageJSON.js'

interface LogErrorOptions {
  commandPath?: string
  error: unknown
}

/**
 * Log Singleton Class.
 */
export class Log {
  private static instance: Log

  private constructor() {}

  public static getInstance(): Log {
    if (Log.instance == null) {
      Log.instance = new Log()
    }
    return Log.instance
  }

  static errorsConfig = new Conf({
    configName: 'log-errors',
    projectSuffix: '',
    fileExtension: 'txt',
    projectName: packageJSON.name,
    projectVersion: packageJSON.version,
    serialize: (value) => {
      return value['errors'] as string
    },
    deserialize: (value) => {
      return { errors: value }
    }
  })

  public error(options: LogErrorOptions): void {
    const { commandPath, error } = options
    const message = error instanceof Error ? error.message : 'Fatal'
    console.error(`${chalk.red('Error:')} ${message}`)
    if (error instanceof LogError && error.logFileMessage != null) {
      const dateString = `[${new Date().toString()}]`
      const commandString =
        commandPath != null ? `[${Leon.NAME} ${commandPath}]` : ''
      const data = `${dateString} ${commandString} ${error.message}\n${error.logFileMessage}\n\n`
      console.error(
        `For further information, look at the log file located at ${Log.errorsConfig.path}`
      )
      if (process.env['NODE_ENV'] === 'test') {
        console.error(data)
      }
      Log.errorsConfig.set('errors', data)
    }
  }
}
