import { cli } from '../../cli.js'
import { UpdateCommand } from '../update.js'

describe('leon update', () => {
  it('should be instance of the command', () => {
    const command = cli.process(['update'])
    expect(command).toBeInstanceOf(UpdateCommand)
  })
})
