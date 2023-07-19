import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

import sinon from 'sinon'
import fsMock from 'mock-fs'
import chalk from 'chalk'

import { LogError } from '../../utils/LogError.js'
import { Log } from '../Log.js'

await test('services/Log', async (t) => {
  const log = Log.getInstance()

  t.afterEach(() => {
    fsMock.restore()
    sinon.restore()
  })

  await t.test('error', async (t) => {
    await t.test(
      'should only display the `message` with `logFileMessage` not defined',
      async () => {
        sinon.stub(console, 'error').value(() => {})
        const message = 'message'
        const consoleErrorSpy = sinon.spy(console, 'error')
        log.error({ error: new LogError({ message }) })
        assert.strictEqual(
          consoleErrorSpy.calledWith(`${chalk.red('Error:')} ${message}`),
          true
        )
      }
    )

    await t.test(
      'should display the `message` and write to log file the `logFileMessage`',
      async () => {
        fsMock({
          [Log.errorsConfig.path]: ''
        })
        sinon.stub(console, 'error').value(() => {})
        const message = 'message'
        const logFileMessage = 'logFileMessage'
        const consoleErrorSpy = sinon.spy(console, 'error')
        let fileContent = await fs.promises.readFile(Log.errorsConfig.path, {
          encoding: 'utf-8'
        })
        assert.strictEqual(fileContent.length, 0)
        log.error({ error: new LogError({ message, logFileMessage }) })
        assert.strictEqual(
          consoleErrorSpy.calledWith(`${chalk.red('Error:')} ${message}`),
          true
        )
        assert.strictEqual(
          consoleErrorSpy.calledWith(
            `For further information, look at the log file located at ${Log.errorsConfig.path}`
          ),
          true
        )
        fileContent = await fs.promises.readFile(Log.errorsConfig.path, {
          encoding: 'utf-8'
        })
        assert.strictEqual(fileContent.includes(message), true)
        assert.strictEqual(fileContent.includes(logFileMessage), true)
      }
    )
  })
})
