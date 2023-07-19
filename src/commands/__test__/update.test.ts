import test from 'node:test'
import assert from 'node:assert/strict'

import { UpdateCommand } from '../update.js'
import { cli } from '../../cli.js'

await test('leon update', async (t) => {
  await t.test('should be instance of the command', async () => {
    const command = cli.process(['update'])
    assert.strictEqual(command instanceof UpdateCommand, true)
  })
})
