import fsMock from 'mock-fs'
import tap from 'tap'

import { isExistingPath } from '../isExistingPath.js'

await tap.test('utils/isExistingPath', async (t) => {
  t.afterEach(() => {
    fsMock.restore()
  })

  await t.test('should return true if the file exists', async () => {
    fsMock({
      '/file.txt': ''
    })
    t.equal(await isExistingPath('/file.txt'), true)
  })

  await t.test("should return false if the file doesn't exists", async () => {
    fsMock({
      '/file.txt': ''
    })
    t.equal(await isExistingPath('/randomfile.txt'), false)
  })
})
