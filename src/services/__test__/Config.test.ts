import fsMock from 'mock-fs'

import { Config, ConfigData } from '../Config.js'
import { LeonInstance } from '../LeonInstance.js'
import { isExistingFile } from '../../utils/isExistingFile.js'

const leonInstance = new LeonInstance({
  name: 'random-name',
  birthDate: 'birthDate',
  mode: 'classic',
  path: '/path',
  startCount: 0
})
const configData: ConfigData = {
  instances: [leonInstance]
}

describe('services/Config - get', () => {
  afterEach(async () => {
    fsMock.restore()
  })

  it('should get the existing config.json file', async () => {
    fsMock({
      [Config.PATH]: JSON.stringify(configData)
    })
    const config = await Config.get()
    expect(config.data.instances.length).toEqual(1)
    expect(config.data.instances[0].name).toEqual(leonInstance.name)
  })

  it('should create and get the new config.json file', async () => {
    fsMock({
      [Config.FOLDER_PATH]: {}
    })
    expect(await isExistingFile(Config.PATH)).toBeFalsy()
    const config = await Config.get()
    expect(config.data.instances.length).toEqual(0)
    expect(await isExistingFile(Config.PATH)).toBeTruthy()
  })
})

describe('services/Config - save', () => {
  afterEach(async () => {
    fsMock.restore()
  })

  it('should save the config file', async () => {
    fsMock({
      [Config.PATH]: JSON.stringify(configData)
    })
    const config = await Config.get()
    expect(config.data.instances.length).toEqual(1)
    config.data.instances.push(leonInstance)
    await config.save()
    const newConfig = await Config.get()
    expect(newConfig.data.instances.length).toEqual(2)
  })
})
