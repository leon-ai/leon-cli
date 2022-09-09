import fs from 'node:fs'

import tap from 'tap'
import sinon from 'sinon'
import fsMock from 'mock-fs'

import { LogError } from '../../utils/LogError.js'
import { Log } from '../Log.js'

await tap.test('services/Log', async (t) => {
  const message = 'Error occured'
  const log = Log.getInstance()

  t.afterEach(() => {
    fsMock.restore()
    sinon.restore()
  })

  await t.test('should write to file the error data', async (t) => {
    fsMock({
      [Log.errorsConfig.path]: ''
    })
    sinon.stub(console, 'error').value(() => {})
    const consoleErrorSpy = sinon.spy(console, 'error')
    let fileContent = await fs.promises.readFile(Log.errorsConfig.path, {
      encoding: 'utf-8'
    })
    t.equal(fileContent.length, 0)
    log.error({ error: new LogError({ message }) })
    t.equal(consoleErrorSpy.called, true)
    fileContent = await fs.promises.readFile(Log.errorsConfig.path, {
      encoding: 'utf-8'
    })
    t.equal(fileContent.includes(message), true)
  })
})
