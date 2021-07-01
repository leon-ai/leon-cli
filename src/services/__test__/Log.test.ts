import fs from 'fs'

import fsMock from 'mock-fs'
import { log } from '../Log'

describe('services/Log - error', () => {
  const stderr = 'Error occured'

  beforeEach(async () => {
    console.error = jest.fn()
    process.exit = jest.fn() as never
  })

  afterEach(async () => {
    fsMock.restore()
    jest.clearAllMocks()
  })

  it('should write to file the error data', async () => {
    fsMock({
      [log.path]: {}
    })
    await log.error({ stderr })
    expect(console.error).toHaveBeenCalled()
    expect(process.exit).toHaveBeenCalled()
    const fileContent = await fs.promises.readFile(log.errorPath, {
      encoding: 'utf-8'
    })
    expect(fileContent.includes(stderr)).toBeTruthy()
  })

  it('should append to file the error data', async () => {
    fsMock({
      [log.errorPath]: ''
    })
    let fileContent = await fs.promises.readFile(log.errorPath, {
      encoding: 'utf-8'
    })
    expect(fileContent.length).toEqual(0)
    await log.error({ stderr })
    expect(console.error).toHaveBeenCalled()
    expect(process.exit).toHaveBeenCalled()
    fileContent = await fs.promises.readFile(log.errorPath, {
      encoding: 'utf-8'
    })
    expect(fileContent.includes(stderr)).toBeTruthy()
  })
})
