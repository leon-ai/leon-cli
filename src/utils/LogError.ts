export interface LogErrorOptions {
  message: string
  logFileMessage?: string
}

export class LogError extends Error implements LogErrorOptions {
  public logFileMessage?: string

  constructor(options: LogErrorOptions) {
    super(options.message)
    this.name = 'LogError'
    this.logFileMessage = options.logFileMessage
    Object.setPrototypeOf(this, LogError.prototype)
  }
}
