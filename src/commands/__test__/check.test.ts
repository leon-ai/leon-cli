import test from 'node:test'
import assert from 'node:assert/strict'

import { cli } from '../../cli.js'
import { CheckCommand } from '../check.js'

await test('leon check', async (t) => {
  await t.test('should be instance of the command', async () => {
    const command = cli.process(['check'])
    assert.strictEqual(command instanceof CheckCommand, true)
  })
})
