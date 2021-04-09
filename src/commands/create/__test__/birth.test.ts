import { Cli } from 'clipanion'

import { CreateBirthCommand } from '../birth'

const cli = new Cli()
cli.register(CreateBirthCommand)

describe('leon create birth', () => {
  it('should be instance of the command', async () => {
    const command = cli.process(['create', 'birth'])
    expect(command).toBeInstanceOf(CreateBirthCommand)
  })

  it('should succeed', async () => {
    const exitCode = await cli.run(['create', 'birth'], Cli.defaultContext)
    expect(exitCode).toEqual(0)
    jest.clearAllMocks()
  })
})
