import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

import { isExistingPath } from './isExistingPath.js'

export const TEMPORARY_URL = new URL('../../temp', import.meta.url)
export const TEMPORARY_PATH = fileURLToPath(TEMPORARY_URL)

export const createTemporaryEmptyFolder = async (): Promise<void> => {
  if (await isExistingPath(TEMPORARY_PATH)) {
    await fs.promises.rm(TEMPORARY_URL, { recursive: true, force: true })
  }
  await fs.promises.mkdir(TEMPORARY_URL)
}
