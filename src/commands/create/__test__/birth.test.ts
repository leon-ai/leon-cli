import tap from 'tap'

import { cli } from '../../../cli.js'
import { CreateBirthCommand } from '../birth.js'

await tap.test('leon create birth', async (t) => {
  await t.test('should be instance of the command', async (t) => {
    const command = cli.process(['create', 'birth'])
    t.equal(command instanceof CreateBirthCommand, true)
  })
})
