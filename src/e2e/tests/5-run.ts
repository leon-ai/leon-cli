import test from 'node:test'
import assert from 'node:assert/strict'

import { execa } from 'execa'

export const test5Run = async (): Promise<void> => {
  await test('leon run', async () => {
    const result = await execa('leon', ['run', 'train'])
    assert.strictEqual(result.exitCode, 0)
  })
}
