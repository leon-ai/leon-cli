import path from 'node:path'

import execa from 'execa'

import { Leon } from '../../services/Leon.js'
import { isExistingFile } from '../../utils/isExistingFile.js'

interface Options {
  useDocker?: boolean
}

export const test1 = (options: Options = {}): void => {
  const { useDocker = false } = options

  it('leon create birth', async () => {
    const commandOptions = useDocker ? ['--docker'] : []
    expect(await isExistingFile(Leon.DEFAULT_BIRTH_PATH)).toBeFalsy()
    const result = await execa(
      'leon',
      ['create', 'birth', '--yes', ...commandOptions],
      {
        stdio: 'inherit'
      }
    )
    expect(result.exitCode).toEqual(0)
    expect(await isExistingFile(Leon.DEFAULT_BIRTH_PATH)).toBeTruthy()
    expect(
      await isExistingFile(path.join(Leon.DEFAULT_BIRTH_PATH, 'package.json'))
    ).toBeTruthy()
    if (!useDocker) {
      expect(
        await isExistingFile(path.join(Leon.DEFAULT_BIRTH_PATH, 'node_modules'))
      ).toBeTruthy()
      expect(
        await isExistingFile(
          path.join(Leon.DEFAULT_BIRTH_PATH, 'server', 'dist')
        )
      ).toBeTruthy()
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
