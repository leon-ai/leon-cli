import test from 'node:test'
import assert from 'node:assert/strict'

import { RunCommand } from '#src/commands/run.js'
import { cli } from '#src/cli.js'

await test('leon run', async (t) => {
  await t.test('should be instance of the command', async () => {
    const command = cli.process(['run'])
    assert.strictEqual(command instanceof RunCommand, true)
  })
})
