import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'

import { execa } from 'execa'

import { Leon } from '#src/services/Leon.js'
import { isExistingPath } from '#src/utils/isExistingPath.js'

const TWENTY_MINUTES = 20 * 60 * 1000

export const test1CreateBirth = async (): Promise<void> => {
  await test(
    'leon create birth',
    {
      timeout: TWENTY_MINUTES
    },
    async () => {
      assert.strictEqual(await isExistingPath(Leon.DEFAULT_BIRTH_PATH), false)
      const result = await execa('leon', ['create', 'birth'], {
        stdio: 'inherit'
      })
      assert.strictEqual(result.exitCode, 0)
      assert.strictEqual(await isExistingPath(Leon.DEFAULT_BIRTH_PATH), true)
      assert.strictEqual(
        await isExistingPath(
          path.join(Leon.DEFAULT_BIRTH_PATH, 'package.json')
        ),
        true
      )
      assert.strictEqual(
        await isExistingPath(
          path.join(Leon.DEFAULT_BIRTH_PATH, 'node_modules')
        ),
        true
      )
      assert.strictEqual(
        await isExistingPath(
          path.join(Leon.DEFAULT_BIRTH_PATH, 'server', 'dist')
        ),
        true
      )
    }
  )
}
