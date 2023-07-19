import test from 'node:test'
import assert from 'node:assert/strict'

import { execa } from 'execa'

export const test4Check = async (): Promise<void> => {
  await test('leon check', async () => {
    const result = await execa('leon', ['check'])
    assert.strictEqual(result.exitCode, 0)
    assert.strictEqual(result.stdout.includes('.: CHECKING :.'), true)
  })
}
