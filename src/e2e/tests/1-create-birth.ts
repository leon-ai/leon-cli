import path from 'node:path'

import execa from 'execa'

import { Leon } from '../../services/Leon.js'
import { isExistingFile } from '../../utils/isExistingFile.js'

interface Options {
  useDocker?: boolean
}

export const test1CreateBirth = (options: Options = {}): void => {
  const { useDocker = false } = options

  test('leon create birth', async () => {
    const commandOptions = useDocker ? ['--docker'] : []
    expect(await isExistingFile(Leon.DEFAULT_BIRTH_PATH)).toBe(false)
    const result = await execa('leon', [
      'create',
      'birth',
      '--yes',
      ...commandOptions
    ])
    console.log(result.stdout)
    console.log(result.stderr)
    expect(result.exitCode).toEqual(0)
    expect(await isExistingFile(Leon.DEFAULT_BIRTH_PATH)).toBe(true)
    expect(
      await isExistingFile(path.join(Leon.DEFAULT_BIRTH_PATH, 'package.json'))
    ).toBe(true)
    if (!useDocker) {
      expect(
        await isExistingFile(path.join(Leon.DEFAULT_BIRTH_PATH, 'node_modules'))
      ).toBe(true)
      expect(
        await isExistingFile(
          path.join(Leon.DEFAULT_BIRTH_PATH, 'server', 'dist')
        )
      ).toBe(true)
    } else {
      const dockerResult = await execa('docker', [
        'image',
        'inspect',
        'leonai/leon'
      ])
      expect(dockerResult.exitCode).toEqual(0)
    }
  })
}
