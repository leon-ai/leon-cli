import * as typanion from 'typanion'

import { Command, Option } from 'clipanion'

export class StartCommand extends Command {
  static paths = [['start']]

  static usage = {
    description: 'Start a Leon instance.'
  }

  public port = Option.String('--port', {
    description: 'Specify listening server port.',
    validator: typanion.isNumber()
  })

  async execute (): Promise<number> {
    return 0
  }
}
