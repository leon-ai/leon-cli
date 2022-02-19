import { cli } from '../../cli.js'
import { InfoCommand } from '../info.js'

describe('leon info', () => {
  it('should be instance of the command', () => {
    const command = cli.process(['info'])
    expect(command).toBeInstanceOf(InfoCommand)
  })
})
