import fs from 'fs'

import fsMock from 'mock-fs'
import { LogError } from '../../utils/LogError'
import { log } from '../Log'

describe('services/Log - error', () => {
  const message = 'Error occured'

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
    await log.error({ error: new LogError({ message }) })
    expect(console.error).toHaveBeenCalled()
    const fileContent = await fs.promises.readFile(log.ERROR_LOG_PATH, {
      encoding: 'utf-8'
    })
    expect(fileContent.includes(message)).toBeTruthy()
  })

  it('should append to file the error data', async () => {
    fsMock({
      [log.ERROR_LOG_PATH]: ''
    })
    let fileContent = await fs.promises.readFile(log.ERROR_LOG_PATH, {
      encoding: 'utf-8'
    })
    expect(fileContent.length).toEqual(0)
    await log.error({ error: new LogError({ message }) })
    expect(console.error).toHaveBeenCalled()
    fileContent = await fs.promises.readFile(log.ERROR_LOG_PATH, {
      encoding: 'utf-8'
    })
    expect(fileContent.includes(message)).toBeTruthy()
  })
})
