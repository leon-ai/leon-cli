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

describe('leon info', () => {
  afterEach(() => {
    fsMock.restore()
    jest.clearAllMocks()
  })

  it('should be instance of the command', () => {
    const command = cli.process(['info'])
    expect(command).toBeInstanceOf(InfoCommand)
  })

  it('should succeeds and display information about instance', async () => {
    console.log = jest.fn()
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
    expect(exitCode).toEqual(0)
    expect(console.log).toHaveBeenNthCalledWith(
      1,
      chalk.cyan('\nLeon instances:\n')
    )
    expect(console.log).toHaveBeenNthCalledWith(
      2,
      table([
        [chalk.bold('Name'), leonInstance.name],
        [chalk.bold('Path'), leonInstance.path],
        [chalk.bold('Mode'), leonInstance.mode],
        [chalk.bold('Birthday'), birthDayString],
        [chalk.bold('Version'), version]
      ])
    )
  })

  it('should succeeds and advise the user to create a instance', async () => {
    console.log = jest.fn()
    fsMock({
      [config.path]: JSON.stringify({ instances: [] })
    })
    const command = cli.process(['info'])
    const exitCode = await command.execute()
    expect(exitCode).toEqual(0)
    expect(console.log).toHaveBeenNthCalledWith(
      1,
      chalk.bold('No Leon instances found.')
    )
    expect(console.log).toHaveBeenNthCalledWith(
      2,
      'You can give birth to a Leon instance using:'
    )
    expect(console.log).toHaveBeenNthCalledWith(
      3,
      chalk.cyan('leon create birth')
    )
  })

  it('should fails and show a error message', async () => {
    console.error = jest.fn()
    fsMock({
      [config.path]: JSON.stringify({ instances: [] }),
      [Log.errorsConfig.path]: ''
    })
    const command = cli.process(['info', '--name="random-name"'])
    const exitCode = await command.execute()
    expect(exitCode).toEqual(1)
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      `${chalk.red(
        'Error:'
      )} This instance doesn't exists, please provider another name.`
    )
    expect(console.error).toHaveBeenNthCalledWith(
      2,
      `For further information, look at the log file located at ${Log.errorsConfig.path}`
    )
  })
})
