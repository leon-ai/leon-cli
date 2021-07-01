import path from 'path'
import fs from 'fs'

import { isExistingFile } from '../utils/isExistingFile'

export const TEMPORARY_PATH = path.join(__dirname, '..', '..', 'temp')

export const createTemporaryEmptyFolder = async (): Promise<void> => {
  if (await isExistingFile(TEMPORARY_PATH)) {
    await fs.promises.rm(TEMPORARY_PATH, { recursive: true, force: true })
  }
  await fs.promises.mkdir(TEMPORARY_PATH)
}
