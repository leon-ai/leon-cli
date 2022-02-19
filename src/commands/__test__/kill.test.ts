import { cli } from '../../cli.js'
import { KillCommand } from '../kill.js'

describe('leon kill', () => {
  it('should be instance of the command', () => {
    const command = cli.process(['kill'])
    expect(command).toBeInstanceOf(KillCommand)
  })
})
