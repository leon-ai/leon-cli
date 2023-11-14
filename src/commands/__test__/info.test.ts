import test from 'node:test'
import assert from 'node:assert/strict'

import sinon from 'sinon'
import fsMock from 'mock-fs'
import chalk from 'chalk'
import { table } from 'table'
import date from 'date-and-time'

import { cli } from '#src/cli.js'
import { InfoCommand } from '#src/commands/info.js'
import type { ConfigData } from '#src/services/Config.js'
import { config } from '#src/services/Config.js'
import type { LeonInstanceOptions } from '#src/services/LeonInstance.js'
import { LeonInstance } from '#src/services/LeonInstance.js'
import { Log } from '#src/services/Log.js'
import { isExistingPath } from '#src/utils/isExistingPath.js'

const leonInstanceOptions: LeonInstanceOptions = {
  name: 'random-name',
  birthDate: '2022-02-20T10:11:33.315Z',
  mode: 'docker',
  path: '/path'
}

const leonInstance = new LeonInstance(leonInstanceOptions)
const configData: ConfigData = {
  instances: [leonInstance]
}
const version = '1.0.0'
const birthDayString = date.format(
  new Date(leonInstance.birthDate),
  'DD/MM/YYYY - HH:mm:ss'
)

await test('leon info', async (t) => {
  t.afterEach(() => {
    fsMock.restore()
    sinon.restore()
  })

  await t.test('should be instance of the command', async () => {
    const command = cli.process(['info'])
    assert.strictEqual(command instanceof InfoCommand, true)
  })

  await t.test(
    'should succeeds and display information about instance',
    async () => {
      sinon.stub(console, 'log').value(() => {})
      const consoleLogSpy = sinon.spy(console, 'log')
      fsMock({
        [config.path]: JSON.stringify(configData),
        [leonInstance.path]: {
          'package.json': JSON.stringify({ version })
        }
      })
      const command = cli.process(['info'])
      const exitCode = await command.execute()
      assert.strictEqual(exitCode, 0)
      assert.strictEqual(
        consoleLogSpy.calledWith(chalk.cyan('\nLeon instances:\n')),
        true
      )
      let infoResult = table([
        [chalk.bold('Name'), leonInstance.name],
        [chalk.bold('Path'), leonInstance.path],
        [chalk.bold('Mode'), leonInstance.mode],
        [chalk.bold('Birth date'), birthDayString],
        [chalk.bold('Version'), version]
      ])
      infoResult += '\n------------------------------\n\n'
      assert.strictEqual(consoleLogSpy.calledWith(infoResult), true)
    }
  )

  await t.test(
    'should succeeds and advise the user to create an instance',
    async () => {
      sinon.stub(console, 'log').value(() => {})
      const consoleLogSpy = sinon.spy(console, 'log')
      fsMock({
        [config.path]: JSON.stringify({ instances: [] })
      })
      const command = cli.process(['info'])
      const exitCode = await command.execute()
      assert.strictEqual(exitCode, 0)
      assert.strictEqual(
        consoleLogSpy.calledWith(chalk.bold('No Leon instances found.')),
        true
      )
      assert.strictEqual(
        consoleLogSpy.calledWith(
          'You can give birth to a Leon instance using:'
        ),
        true
      )
      assert.strictEqual(
        consoleLogSpy.calledWith(chalk.cyan('leon create birth')),
        true
      )
    }
  )

  await t.test(
    'should succeeds and advise the user to create an instance with instance path not found',
    async () => {
      sinon.stub(console, 'log').value(() => {})
      const consoleLogSpy = sinon.spy(console, 'log')
      fsMock({
        [config.path]: JSON.stringify(configData)
      })
      const command = cli.process(['info'])
      const exitCode = await command.execute()
      assert.strictEqual(exitCode, 0)
      assert.strictEqual(await isExistingPath(leonInstance.path), false)
      assert.deepStrictEqual(config.get('instances', []), [])
      assert.strictEqual(
        consoleLogSpy.calledWith(chalk.bold('No Leon instances found.')),
        true
      )
      assert.strictEqual(
        consoleLogSpy.calledWith(
          'You can give birth to a Leon instance using:'
        ),
        true
      )
      assert.strictEqual(
        consoleLogSpy.calledWith(chalk.cyan('leon create birth')),
        true
      )
    }
  )

  await t.test(
    'should succeeds even with `package.json` of the instance not found',
    async () => {
      sinon.stub(console, 'log').value(() => {})
      const consoleLogSpy = sinon.spy(console, 'log')
      fsMock({
        [config.path]: JSON.stringify(configData),
        [leonInstance.path]: {}
      })
      const command = cli.process(['info'])
      const exitCode = await command.execute()
      assert.strictEqual(exitCode, 0)
      assert.strictEqual(
        consoleLogSpy.calledWith(chalk.cyan('\nLeon instances:\n')),
        true
      )
      let infoResult = table([
        [chalk.bold('Name'), leonInstance.name],
        [chalk.bold('Path'), leonInstance.path],
        [chalk.bold('Mode'), leonInstance.mode],
        [chalk.bold('Birth date'), birthDayString],
        [chalk.bold('Version'), '0.0.0']
      ])
      infoResult += '\n------------------------------\n\n'
      assert.strictEqual(consoleLogSpy.calledWith(infoResult), true)
    }
  )

  await t.test('should fails and show a error message', async () => {
    sinon.stub(console, 'error').value(() => {})
    const consoleErrorSpy = sinon.spy(console, 'error')
    fsMock({
      [config.path]: JSON.stringify({ instances: [] }),
      [Log.errorsConfig.path]: ''
    })
    const command = cli.process(['info', '--name="random-name"'])
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
  })
})
