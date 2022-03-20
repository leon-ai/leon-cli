import fsMock from 'mock-fs'
import chalk from 'chalk'

import { cli } from '../../cli.js'
import { DeleteCommand } from '../delete.js'
import { config, ConfigData } from '../../services/Config.js'
import {
  LeonInstance,
  LeonInstanceOptions
} from '../../services/LeonInstance.js'
import { isExistingFile } from '../../utils/isExistingFile.js'
import { Log } from '../../services/Log.js'

describe('leon delete', () => {
  afterEach(() => {
    fsMock.restore()
    jest.clearAllMocks()
  })

  it('should be instance of the command', () => {
    const command = cli.process(['delete'])
    expect(command).toBeInstanceOf(DeleteCommand)
  })

  it('succeeds and delete the LeonInstance', async () => {
    console.log = jest.fn()
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
    expect(await isExistingFile(leonInstance.path)).toBe(true)
    const command = cli.process(['delete', '--yes'])
    const exitCode = await command.execute()
    const instances = config.get('instances', [])
    expect(exitCode).toEqual(0)
    expect(await isExistingFile(leonInstance.path)).toBe(false)
    expect(instances).toEqual([])
    expect(console.log).toHaveBeenCalledWith(
      `Leon instance "${leonInstance.name}" deleted.`
    )
  })

  it('fails and show a error message', async () => {
    console.error = jest.fn()
    fsMock({
      [config.path]: JSON.stringify({ instances: [] }),
      [Log.errorsConfig.path]: ''
    })
    const command = cli.process(['delete', '--yes'])
    const exitCode = await command.execute()
    expect(exitCode).toEqual(1)
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      `${chalk.red('Error:')} You should have at least one instance.`
    )
    expect(console.error).toHaveBeenNthCalledWith(
      2,
      `For further information, look at the log file located at ${Log.errorsConfig.path}`
    )
  })
})
