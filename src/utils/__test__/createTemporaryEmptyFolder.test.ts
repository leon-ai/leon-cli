import fs from 'node:fs'

import fsMock from 'mock-fs'
import tap from 'tap'

import {
  TEMPORARY_PATH,
  createTemporaryEmptyFolder
} from '../createTemporaryEmptyFolder.js'
import { isExistingPath } from '../isExistingPath.js'

await tap.test('utils/createTemporaryEmptyFolder', async (t) => {
  t.afterEach(() => {
    fsMock.restore()
  })

  await t.test('should create the temporary folder', async (t) => {
    fsMock({})
    t.equal(await isExistingPath(TEMPORARY_PATH), false)
    await createTemporaryEmptyFolder()
    t.equal(await isExistingPath(TEMPORARY_PATH), true)
  })

  await t.test(
    'should remove and create again the temporary folder',
    async (t) => {
      fsMock({
        [TEMPORARY_PATH]: {
          'file.txt': ''
        }
      })
      t.equal(await isExistingPath(TEMPORARY_PATH), true)
      t.equal((await fs.promises.readdir(TEMPORARY_PATH)).length, 1)
      await createTemporaryEmptyFolder()
      t.equal((await fs.promises.readdir(TEMPORARY_PATH)).length, 0)
    }
  )
})
