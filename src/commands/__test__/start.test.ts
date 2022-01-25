import { cli } from '../../cli.js'
import { StartCommand } from '../start.js'

describe('leon start', () => {
  it('should be instance of the command', async () => {
    const command = cli.process(['start'])
    expect(command).toBeInstanceOf(StartCommand)
  })
})
