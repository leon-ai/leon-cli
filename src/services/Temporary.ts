import path from 'path'
import * as fsWithCallbacks from 'fs'

import { isExistingFile } from '../utils/isExistingFile'

const fs = fsWithCallbacks.promises

class Temporary {
  public PATH = path.join(__dirname, '..', '..', 'temp')

  public async createEmptyFolder (): Promise<void> {
    if (await isExistingFile(this.PATH)) {
      await fs.rm(this.PATH, { recursive: true, force: true })
    }
    await fs.mkdir(this.PATH)
  }
}

export const temporary = new Temporary()
