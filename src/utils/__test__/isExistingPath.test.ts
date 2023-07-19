import test from 'node:test'
import assert from 'node:assert/strict'

import fsMock from 'mock-fs'

import { isExistingPath } from '../isExistingPath.js'

await test('utils/isExistingPath', async (t) => {
  t.afterEach(() => {
    fsMock.restore()
  })

  await t.test('should return true if the file exists', async () => {
    fsMock({
      '/file.txt': ''
    })
    assert.strictEqual(await isExistingPath('/file.txt'), true)
  })

  await t.test("should return false if the file doesn't exists", async () => {
    fsMock({
      '/file.txt': ''
    })
    assert.strictEqual(await isExistingPath('/randomfile.txt'), false)
  })
})
