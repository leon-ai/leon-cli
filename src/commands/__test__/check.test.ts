import test from 'node:test'
import assert from 'node:assert/strict'

import { cli } from '#src/cli.js'
import { CheckCommand } from '#src/commands/check.js'

await test('leon check', async (t) => {
  await t.test('should be instance of the command', async () => {
    const command = cli.process(['check'])
    assert.strictEqual(command instanceof CheckCommand, true)
  })
})
