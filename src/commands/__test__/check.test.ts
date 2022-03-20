import tap from 'tap'

import { cli } from '../../cli.js'
import { CheckCommand } from '../check.js'

await tap.test('leon check', async (t) => {
  await t.test('should be instance of the command', async (t) => {
    const command = cli.process(['check'])
    t.equal(command instanceof CheckCommand, true)
  })
})
