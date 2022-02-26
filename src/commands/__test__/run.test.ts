import { cli } from '../../cli.js'
import { RunCommand } from '../run.js'

describe('leon run', () => {
  it('should be instance of the command', () => {
    const command = cli.process(['run'])
    expect(command).toBeInstanceOf(RunCommand)
  })
})
