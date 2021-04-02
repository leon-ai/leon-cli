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
    console.log = jest.fn()
    const exitCode = await cli.run(['create', 'birth'], Cli.defaultContext)
    expect(console.log).toHaveBeenCalled()
    expect(exitCode).toEqual(0)
    jest.clearAllMocks()
  })
})
