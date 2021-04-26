import * as fsWithCallbacks from 'fs'
import fsMock from 'mock-fs'
import { log } from '../Log'

const fs = fsWithCallbacks.promises

describe('services/Log - error', () => {
  const errorData = 'Error happened'

  beforeEach(async () => {
    console.error = jest.fn()
  })

  afterEach(async () => {
    fsMock.restore()
    jest.clearAllMocks()
  })

  it('should write to file the error data', async () => {
    fsMock({
      [log.path]: {}
    })
    await log.error(errorData)
    expect(console.error).toHaveBeenCalled()
    const fileContent = await fs.readFile(log.errorPath, { encoding: 'utf-8' })
    expect(fileContent.includes(errorData)).toBeTruthy()
  })

  it('should append to file the error data', async () => {
    fsMock({
      [log.errorPath]: ''
    })
    let fileContent = await fs.readFile(log.errorPath, { encoding: 'utf-8' })
    expect(fileContent.length).toEqual(0)
    await log.error(errorData)
    expect(console.error).toHaveBeenCalled()
    fileContent = await fs.readFile(log.errorPath, { encoding: 'utf-8' })
    expect(fileContent.includes(errorData)).toBeTruthy()
  })
})
