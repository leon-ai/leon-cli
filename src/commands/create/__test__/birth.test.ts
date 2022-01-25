import { cli } from '../../../cli.js'
import { CreateBirthCommand } from '../birth.js'

describe('leon create birth', () => {
  it('should be instance of the command', async () => {
    const command = cli.process(['create', 'birth'])
    expect(command).toBeInstanceOf(CreateBirthCommand)
  })
})
