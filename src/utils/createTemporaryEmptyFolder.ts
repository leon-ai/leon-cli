import path from 'path'
import * as fsWithCallbacks from 'fs'

import { isExistingFile } from '../utils/isExistingFile'

const fs = fsWithCallbacks.promises

export const TEMPORARY_PATH = path.join(__dirname, '..', '..', 'temp')

export const createTemporaryEmptyFolder = async (): Promise<void> => {
  if (await isExistingFile(TEMPORARY_PATH)) {
    await fs.rm(TEMPORARY_PATH, { recursive: true, force: true })
  }
  await fs.mkdir(TEMPORARY_PATH)
}
