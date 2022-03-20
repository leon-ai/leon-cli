import tap from 'tap'

import { RunCommand } from '../run.js'
import { cli } from '../../cli.js'

await tap.test('leon run', async (t) => {
  await t.test('should be instance of the command', async (t) => {
    const command = cli.process(['run'])
    t.equal(command instanceof RunCommand, true)
  })
})
