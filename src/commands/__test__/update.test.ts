import tap from 'tap'

import { UpdateCommand } from '../update.js'
import { cli } from '../../cli.js'

await tap.test('leon update', async (t) => {
  await t.test('should be instance of the command', async (t) => {
    const command = cli.process(['update'])
    t.equal(command instanceof UpdateCommand, true)
  })
})
