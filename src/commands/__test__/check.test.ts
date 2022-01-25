import { cli } from '../../cli.js'
import { CheckCommand } from '../check.js'

describe('leon check', () => {
  it('should be instance of the command', async () => {
    const command = cli.process(['check'])
    expect(command).toBeInstanceOf(CheckCommand)
  })
})
