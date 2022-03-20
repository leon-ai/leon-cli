import fsMock from 'mock-fs'
import tap from 'tap'

import { isExistingFile } from '../isExistingFile.js'

await tap.test('utils/isExistingFile', async (t) => {
  t.afterEach(() => {
    fsMock.restore()
  })

  await t.test('should return true if the file exists', async () => {
    fsMock({
      '/file.txt': ''
    })
    t.equal(await isExistingFile('/file.txt'), true)
  })

  await t.test("should return false if the file doesn't exists", async () => {
    fsMock({
      '/file.txt': ''
    })
    t.equal(await isExistingFile('/randomfile.txt'), false)
  })
})
