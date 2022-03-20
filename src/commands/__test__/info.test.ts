import tap from 'tap'
import sinon from 'sinon'
import fsMock from 'mock-fs'
import chalk from 'chalk'
import { table } from 'table'
import date from 'date-and-time'

import { cli } from '../../cli.js'
import { InfoCommand } from '../info.js'
import { config, ConfigData } from '../../services/Config.js'
import {
  LeonInstance,
  LeonInstanceOptions
} from '../../services/LeonInstance.js'
import { Log } from '../../services/Log.js'

await tap.test('leon info', async (t) => {
  t.afterEach(() => {
    fsMock.restore()
    sinon.restore()
  })

  await t.test('should be instance of the command', async (t) => {
    const command = cli.process(['info'])
    t.equal(command instanceof InfoCommand, true)
  })

  await t.test(
    'should succeeds and display information about instance',
    async (t) => {
      sinon.stub(console, 'log').value(() => {})
      const consoleLogSpy = sinon.spy(console, 'log')
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
      const version = '1.0.0'
      const birthDayString = date.format(
        new Date(leonInstance.birthDate),
        'DD/MM/YYYY - HH:mm:ss'
      )
      fsMock({
        [config.path]: JSON.stringify(configData),
        [leonInstance.path]: {
          'package.json': JSON.stringify({ version })
        }
      })
      const command = cli.process(['info'])
      const exitCode = await command.execute()
      t.equal(exitCode, 0)
      t.equal(consoleLogSpy.calledWith(chalk.cyan('\nLeon instances:\n')), true)
      t.equal(
        consoleLogSpy.calledWith(
          table([
            [chalk.bold('Name'), leonInstance.name],
            [chalk.bold('Path'), leonInstance.path],
            [chalk.bold('Mode'), leonInstance.mode],
            [chalk.bold('Birth date'), birthDayString],
            [chalk.bold('Version'), version]
          ])
        ),
        true
      )
    }
  )

  await t.test(
    'should succeeds and advise the user to create a instance',
    async (t) => {
      sinon.stub(console, 'log').value(() => {})
      const consoleLogSpy = sinon.spy(console, 'log')
      fsMock({
        [config.path]: JSON.stringify({ instances: [] })
      })
      const command = cli.process(['info'])
      const exitCode = await command.execute()
      t.equal(exitCode, 0)
      t.equal(
        consoleLogSpy.calledWith(chalk.bold('No Leon instances found.')),
        true
      )
      t.equal(
        consoleLogSpy.calledWith(
          'You can give birth to a Leon instance using:'
        ),
        true
      )
      t.equal(consoleLogSpy.calledWith(chalk.cyan('leon create birth')), true)
    }
  )

  await t.test('should fails and show a error message', async (t) => {
    sinon.stub(console, 'error').value(() => {})
    const consoleErrorSpy = sinon.spy(console, 'error')
    fsMock({
      [config.path]: JSON.stringify({ instances: [] }),
      [Log.errorsConfig.path]: ''
    })
    const command = cli.process(['info', '--name="random-name"'])
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
    t.equal(
      consoleErrorSpy.calledWith(
        `For further information, look at the log file located at ${Log.errorsConfig.path}`
      ),
      true
    )
  })
})
