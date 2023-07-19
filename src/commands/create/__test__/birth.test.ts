import test from 'node:test'
import assert from 'node:assert/strict'

import { cli } from '../../../cli.js'
import { CreateBirthCommand } from '../birth.js'

await test('leon create birth', async (t) => {
  await t.test('should be instance of the command', async () => {
    const command = cli.process(['create', 'birth'])
    assert.strictEqual(command instanceof CreateBirthCommand, true)
  })
})
