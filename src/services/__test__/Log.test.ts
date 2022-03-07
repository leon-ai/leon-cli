import fs from 'node:fs'

import fsMock from 'mock-fs'

import { LogError } from '../../utils/LogError.js'
import { Log, log } from '../Log.js'

describe('services/Log', () => {
  const message = 'Error occured'

  beforeEach(() => {
    console.error = jest.fn()
    process.exit = jest.fn() as never
  })

  afterEach(() => {
    fsMock.restore()
    jest.clearAllMocks()
  })

  it('should write to file the error data', async () => {
    fsMock({
      [Log.errorsConfig.path]: ''
    })
    let fileContent = await fs.promises.readFile(Log.errorsConfig.path, {
      encoding: 'utf-8'
    })
    expect(fileContent.length).toEqual(0)
    log.error({ error: new LogError({ message }) })
    expect(console.error).toHaveBeenCalled()
    fileContent = await fs.promises.readFile(Log.errorsConfig.path, {
      encoding: 'utf-8'
    })
    expect(fileContent.includes(message)).toBe(true)
  })
})
