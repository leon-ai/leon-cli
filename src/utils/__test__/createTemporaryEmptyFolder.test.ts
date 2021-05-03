import fsMock from 'mock-fs'
import * as fsWithCallbacks from 'fs'

import {
  TEMPORARY_PATH,
  createTemporaryEmptyFolder
} from '../createTemporaryEmptyFolder'
import { isExistingFile } from '../isExistingFile'

const fs = fsWithCallbacks.promises

describe('utils/createTemporaryEmptyFolder', () => {
  afterEach(async () => {
    fsMock.restore()
  })

  it('should create the temporary folder', async () => {
    fsMock({})
    expect(await isExistingFile(TEMPORARY_PATH)).toBeFalsy()
    await createTemporaryEmptyFolder()
    expect(await isExistingFile(TEMPORARY_PATH)).toBeTruthy()
  })

  it('should remove and create again the temporary folder', async () => {
    fsMock({
      [TEMPORARY_PATH]: {
        'file.txt': ''
      }
    })
    expect(await isExistingFile(TEMPORARY_PATH)).toBeTruthy()
    expect((await fs.readdir(TEMPORARY_PATH)).length).toEqual(1)
    await createTemporaryEmptyFolder()
    expect((await fs.readdir(TEMPORARY_PATH)).length).toEqual(0)
  })
})
