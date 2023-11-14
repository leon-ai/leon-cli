import test from 'node:test'
import assert from 'node:assert/strict'

import sinon from 'sinon'
import fsMock from 'mock-fs'
import chalk from 'chalk'

import { StartCommand } from '#src/commands/start.js'
import { cli } from '#src/cli.js'
import type { ConfigData } from '#src/services/Config.js'
import { config } from '#src/services/Config.js'
import type { LeonInstanceOptions } from '#src/services/LeonInstance.js'
import { LeonInstance } from '#src/services/LeonInstance.js'
import { isExistingPath } from '#src/utils/isExistingPath.js'

const leonInstanceOptions: LeonInstanceOptions = {
  name: 'random-name',
  birthDate: '2022-02-20T10:11:33.315Z',
  path: '/path'
}

const leonInstance = new LeonInstance(leonInstanceOptions)
const configData: ConfigData = {
  instances: [leonInstance]
}

await test('leon start', async (t) => {
  t.afterEach(() => {
    fsMock.restore()
    sinon.restore()
  })

  await t.test('should be instance of the command', async () => {
    const command = cli.process(['start'])
    assert.strictEqual(command instanceof StartCommand, true)
  })

  await t.test(
    'should fails with instance not found (automatic config cleaner)',
    async () => {
      sinon.stub(console, 'error').value(() => {})
      const consoleErrorSpy = sinon.spy(console, 'error')
      fsMock({
        [config.path]: JSON.stringify(configData)
      })
      const command = cli.process(['start'])
      const exitCode = await command.execute()
      assert.strictEqual(exitCode, 1)
      assert.strictEqual(await isExistingPath(leonInstance.path), false)
      assert.deepStrictEqual(config.get('instances', []), [])
      assert.strictEqual(
        consoleErrorSpy.calledWith(
          `${chalk.red('Error:')} You should have at least one instance.`
        ),
        true
      )
    }
  )

  await t.test(
    'should fails with instance not found with specified name',
    async () => {
      sinon.stub(console, 'error').value(() => {})
      const consoleErrorSpy = sinon.spy(console, 'error')
      fsMock({
        [config.path]: JSON.stringify(configData)
      })
      const command = cli.process(['start', '--name="random-name"'])
      const exitCode = await command.execute()
      assert.strictEqual(exitCode, 1)
      assert.strictEqual(
        consoleErrorSpy.calledWith(
          `${chalk.red(
            'Error:'
          )} This instance doesn't exists, please provider another name.`
        ),
        true
      )
    }
  )
})
