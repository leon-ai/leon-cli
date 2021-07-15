import { cli } from '../../cli'
import { CheckCommand } from '../check'

describe('leon check', () => {
  it('should be instance of the command', async () => {
    const command = cli.process(['check'])
    expect(command).toBeInstanceOf(CheckCommand)
  })
})
