import fsMock from 'mock-fs'

import { isExistingFile } from '../isExistingFile.js'

describe('utils/isExistingFile', () => {
  afterEach(() => {
    fsMock.restore()
  })

  it('should return true if the file exists', async () => {
    fsMock({
      '/file.txt': ''
    })
    expect(await isExistingFile('/file.txt')).toBe(true)
  })

  it("should return false if the file doesn't exists", async () => {
    fsMock({
      '/file.txt': ''
    })
    expect(await isExistingFile('/randomfile.txt')).toBe(false)
  })
})
