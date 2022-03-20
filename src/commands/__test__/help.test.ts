import tap from 'tap'

import { HelpCommand } from '../help.js'
import { cli } from '../../cli.js'

await tap.test('leon help', async (t) => {
  await t.test('should be instance of the command', async (t) => {
    const command = cli.process(['help'])
    t.equal(command instanceof HelpCommand, true)
  })
})
