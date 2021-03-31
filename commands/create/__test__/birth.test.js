const { Cli } = require('clipanion')

const CreateBirthCommand = require('../birth')

const cli = new Cli()
cli.register(CreateBirthCommand)

describe('leon create birth', () => {
  it('should be instance of the command', async () => {
    const command = cli.process(['create', 'birth'])
    expect(command).toBeInstanceOf(CreateBirthCommand)
  })

  it('should succeed', async () => {
    console.log = jest.fn()
    const exitCode = await cli.run(['create', 'birth'])
    expect(console.log).toHaveBeenCalled()
    expect(exitCode).toEqual(0)
    jest.clearAllMocks()
  })
})
