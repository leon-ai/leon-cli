import tap from 'tap'
import sinon from 'sinon'
import fsMock from 'mock-fs'
import chalk from 'chalk'

import { StartCommand } from '../start.js'
import { cli } from '../../cli.js'
import type { ConfigData } from '../../services/Config.js'
import { config } from '../../services/Config.js'
import type { LeonInstanceOptions } from '../../services/LeonInstance.js'
import { LeonInstance } from '../../services/LeonInstance.js'
import { isExistingPath } from '../../utils/isExistingPath.js'

const leonInstanceOptions: LeonInstanceOptions = {
  name: 'random-name',
  birthDate: '2022-02-20T10:11:33.315Z',
  mode: 'docker',
  path: '/path',
  startCount: 0
}

const leonInstance = new LeonInstance(leonInstanceOptions)
const configData: ConfigData = {
  instances: [leonInstance]
}

await tap.test('leon start', async (t) => {
  t.afterEach(() => {
    fsMock.restore()
    sinon.restore()
  })

  await t.test('should be instance of the command', async (t) => {
    const command = cli.process(['start'])
    t.equal(command instanceof StartCommand, true)
  })

  await t.test(
    'should fails with instance not found (automatic config cleaner)',
    async (t) => {
      sinon.stub(console, 'error').value(() => {})
      const consoleErrorSpy = sinon.spy(console, 'error')
      fsMock({
        [config.path]: JSON.stringify(configData)
      })
      const command = cli.process(['start'])
      const exitCode = await command.execute()
      t.equal(exitCode, 1)
      t.equal(await isExistingPath(leonInstance.path), false)
      t.strictSame(config.get('instances', []), [])
      t.equal(
        consoleErrorSpy.calledWith(
          `${chalk.red('Error:')} You should have at least one instance.`
        ),
        true
      )
    }
  )

  await t.test(
    'should fails with instance not found with specified name',
    async (t) => {
      sinon.stub(console, 'error').value(() => {})
      const consoleErrorSpy = sinon.spy(console, 'error')
      fsMock({
        [config.path]: JSON.stringify(configData)
      })
      const command = cli.process(['start', '--name="random-name"'])
      const exitCode = await command.execute()
      t.equal(exitCode, 1)
      t.equal(
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
