import fsMock from 'mock-fs'

import { isExistingFile } from '../isExistingFile'

describe('utils/isExistingFile', () => {
  afterEach(async () => {
    fsMock.restore()
  })

  it('should return true if the file exists', async () => {
    fsMock({
      '/file.txt': ''
    })
    expect(await isExistingFile('/file.txt')).toBeTruthy()
  })

  it("should return false if the file doesn't exists", async () => {
    fsMock({
      '/file.txt': ''
    })
    expect(await isExistingFile('/randomfile.txt')).toBeFalsy()
  })
})
