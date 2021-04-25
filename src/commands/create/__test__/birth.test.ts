import { cli } from '../../../cli'
import { CreateBirthCommand } from '../birth'

describe('leon create birth', () => {
  it('should be instance of the command', async () => {
    const command = cli.process(['create', 'birth'])
    expect(command).toBeInstanceOf(CreateBirthCommand)
  })
})
