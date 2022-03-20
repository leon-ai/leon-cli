import tap from 'tap'

import { StartCommand } from '../start.js'
import { cli } from '../../cli.js'

await tap.test('leon start', async (t) => {
  await t.test('should be instance of the command', async (t) => {
    const command = cli.process(['start'])
    t.equal(command instanceof StartCommand, true)
  })
})
