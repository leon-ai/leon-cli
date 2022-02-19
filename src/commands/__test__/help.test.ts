import { cli } from '../../cli.js'
import { HelpCommand } from '../help.js'

describe('leon help', () => {
  it('should be instance of the command', () => {
    const command = cli.process(['help'])
    expect(command).toBeInstanceOf(HelpCommand)
  })
})
