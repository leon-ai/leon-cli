import test from 'node:test'
import assert from 'node:assert/strict'

import { HelpCommand } from '../help.js'
import { cli } from '../../cli.js'

await test('leon help', async (t) => {
  await t.test('should be instance of the command', async () => {
    const command = cli.process(['help'])
    assert.strictEqual(command instanceof HelpCommand, true)
  })
})
