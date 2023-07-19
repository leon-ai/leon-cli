import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'

import { execa } from 'execa'

import { Leon } from '../../services/Leon.js'
import { isExistingPath } from '../../utils/isExistingPath.js'

interface Options {
  useDocker?: boolean
}

const TWENTY_MINUTES = 20 * 60 * 1000

export const test1CreateBirth = async (
  options: Options = {}
): Promise<void> => {
  const { useDocker = false } = options

  await test(
    'leon create birth',
    {
      timeout: TWENTY_MINUTES
    },
    async () => {
      const commandOptions = useDocker ? ['--docker'] : []
      assert.strictEqual(await isExistingPath(Leon.DEFAULT_BIRTH_PATH), false)
      const result = await execa(
        'leon',
        ['create', 'birth', ...commandOptions],
        {
          stdio: 'inherit'
        }
      )
      assert.strictEqual(result.exitCode, 0)
      assert.strictEqual(await isExistingPath(Leon.DEFAULT_BIRTH_PATH), true)
      assert.strictEqual(
        await isExistingPath(
          path.join(Leon.DEFAULT_BIRTH_PATH, 'package.json')
        ),
        true
      )
      if (!useDocker) {
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
      } else {
        const dockerResult = await execa('docker', [
          'image',
          'inspect',
          'leon-ai/leon'
        ])
        assert.strictEqual(dockerResult.exitCode, 0)
      }
    }
  )
}
