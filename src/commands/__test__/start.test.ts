import { cli } from '../../cli'
import { StartCommand } from '../start'

describe('leon start', () => {
  it('should be instance of the command', async () => {
    const command = cli.process(['start'])
    expect(command).toBeInstanceOf(StartCommand)
  })
})
