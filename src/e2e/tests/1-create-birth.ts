import path from 'node:path'

import tap from 'tap'
import { execa } from 'execa'

import { Leon } from '../../services/Leon.js'
import { isExistingFile } from '../../utils/isExistingFile.js'

interface Options {
  useDocker?: boolean
}

export const test1CreateBirth = async (
  options: Options = {}
): Promise<void> => {
  const { useDocker = false } = options

  await tap.test('leon create birth', async (t) => {
    const commandOptions = useDocker ? ['--docker'] : []
    t.equal(await isExistingFile(Leon.DEFAULT_BIRTH_PATH), false)
    const result = await execa(
      'leon',
      ['create', 'birth', '--yes', '--no-git', ...commandOptions],
      { stdio: 'inherit' }
    )
    t.equal(result.exitCode, 0)
    t.equal(await isExistingFile(Leon.DEFAULT_BIRTH_PATH), true)
    t.equal(
      await isExistingFile(path.join(Leon.DEFAULT_BIRTH_PATH, 'package.json')),
      true
    )
    if (!useDocker) {
      t.equal(
        await isExistingFile(
          path.join(Leon.DEFAULT_BIRTH_PATH, 'node_modules')
        ),
        true
      )
      t.equal(
        await isExistingFile(
          path.join(Leon.DEFAULT_BIRTH_PATH, 'server', 'dist')
        ),
        true
      )
    } else {
      const dockerResult = await execa('docker', [
        'image',
        'inspect',
        'leonai/leon'
      ])
      t.equal(dockerResult.exitCode, 0)
    }
  })
}
