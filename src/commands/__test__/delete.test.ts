import test from 'node:test'
import assert from 'node:assert/strict'

import sinon from 'sinon'
import fsMock from 'mock-fs'
import chalk from 'chalk'

import { cli } from '#src/cli.js'
import { DeleteCommand } from '#src/commands/delete.js'
import type { ConfigData } from '#src/services/Config.js'
import { config } from '#src/services/Config.js'
import type { LeonInstanceOptions } from '#src/services/LeonInstance.js'
import { LeonInstance } from '#src/services/LeonInstance.js'
import { isExistingPath } from '#src/utils/isExistingPath.js'
import { Log } from '#src/services/Log.js'

await test('leon delete', async (t) => {
  t.afterEach(() => {
    fsMock.restore()
    sinon.restore()
  })

  await t.test('should be instance of the command', async () => {
    const command = cli.process(['delete'])
    assert.strictEqual(command instanceof DeleteCommand, true)
  })

  await t.test('succeeds and delete the LeonInstance', async () => {
    sinon.stub(console, 'log').value(() => {})
    const consoleLogSpy = sinon.spy(console, 'log')
    const leonInstanceOptions: LeonInstanceOptions = {
      name: 'random-name',
      birthDate: 'birthDate',
      path: '/path'
    }
    const leonInstance = new LeonInstance(leonInstanceOptions)
    const configData: ConfigData = {
      instances: [leonInstance]
    }
    fsMock({
      [config.path]: JSON.stringify(configData),
      [leonInstance.path]: {}
    })
    assert.strictEqual(await isExistingPath(leonInstance.path), true)
    const command = cli.process(['delete', '--yes'])
    const exitCode = await command.execute()
    const instances = config.get('instances', [])
    assert.strictEqual(exitCode, 0)
    assert.strictEqual(await isExistingPath(leonInstance.path), false)
    assert.deepStrictEqual(instances, [])
    assert.strictEqual(
      consoleLogSpy.calledWith(`Leon instance "${leonInstance.name}" deleted.`),
      true
    )
  })

  await t.test('fails and show a error message', async () => {
    sinon.stub(console, 'error').value(() => {})
    const consoleErrorSpy = sinon.spy(console, 'error')
    fsMock({
      [config.path]: JSON.stringify({ instances: [] }),
      [Log.errorsConfig.path]: ''
    })
    const command = cli.process(['delete', '--yes'])
    const exitCode = await command.execute()
    assert.strictEqual(exitCode, 1)
    assert.strictEqual(
      consoleErrorSpy.calledWith(
        `${chalk.red('Error:')} You should have at least one instance.`
      ),
      true
    )
  })
})
