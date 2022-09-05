import tap from 'tap'
import sinon from 'sinon'
import fsMock from 'mock-fs'
import chalk from 'chalk'

import { cli } from '../../cli.js'
import { DeleteCommand } from '../delete.js'
import type { ConfigData } from '../../services/Config.js'
import { config } from '../../services/Config.js'
import type { LeonInstanceOptions } from '../../services/LeonInstance.js'
import { LeonInstance } from '../../services/LeonInstance.js'
import { isExistingPath } from '../../utils/isExistingPath.js'
import { Log } from '../../services/Log.js'

await tap.test('leon delete', async (t) => {
  t.afterEach(() => {
    fsMock.restore()
    sinon.restore()
  })

  await t.test('should be instance of the command', async (t) => {
    const command = cli.process(['delete'])
    t.equal(command instanceof DeleteCommand, true)
  })

  await t.test('succeeds and delete the LeonInstance', async (t) => {
    sinon.stub(console, 'log').value(() => {})
    const consoleLogSpy = sinon.spy(console, 'log')
    const leonInstanceOptions: LeonInstanceOptions = {
      name: 'random-name',
      birthDate: 'birthDate',
      mode: 'docker',
      path: '/path',
      startCount: 0
    }
    const leonInstance = new LeonInstance(leonInstanceOptions)
    const configData: ConfigData = {
      instances: [leonInstance]
    }
    fsMock({
      [config.path]: JSON.stringify(configData),
      [leonInstance.path]: {}
    })
    t.equal(await isExistingPath(leonInstance.path), true)
    const command = cli.process(['delete', '--yes'])
    const exitCode = await command.execute()
    const instances = config.get('instances', [])
    t.equal(exitCode, 0)
    t.equal(await isExistingPath(leonInstance.path), false)
    t.strictSame(instances, [])
    t.equal(
      consoleLogSpy.calledWith(`Leon instance "${leonInstance.name}" deleted.`),
      true
    )
  })

  await t.test('fails and show a error message', async (t) => {
    sinon.stub(console, 'error').value(() => {})
    const consoleErrorSpy = sinon.spy(console, 'error')
    fsMock({
      [config.path]: JSON.stringify({ instances: [] }),
      [Log.errorsConfig.path]: ''
    })
    const command = cli.process(['delete', '--yes'])
    const exitCode = await command.execute()
    t.equal(exitCode, 1)
    t.equal(
      consoleErrorSpy.calledWith(
        `${chalk.red('Error:')} You should have at least one instance.`
      ),
      true
    )
    t.equal(
      consoleErrorSpy.calledWith(
        `For further information, look at the log file located at ${Log.errorsConfig.path}`
      ),
      true
    )
  })
})
