import fsMock from 'mock-fs'

import { Config, ConfigData } from '../Config'
import { CreateOptions, LeonInstance, LeonInstanceOptions } from '../LeonInstance'
import { log } from '../Log'

const leonInstanceOptions: LeonInstanceOptions = {
  name: 'random-name',
  birthDate: 'birthDate',
  mode: 'docker',
  path: '/path'
}

const leonCreateOptions: CreateOptions = {
  ...leonInstanceOptions,
  shouldBuild: false,
  yes: false
}

const leonInstance = new LeonInstance(leonInstanceOptions)
const configData: ConfigData = {
  instances: [leonInstance]
}

describe('services/LeonInstance - find', () => {
  beforeEach(async () => {
    fsMock({
      [Config.PATH]: JSON.stringify(configData)
    })
  })

  afterEach(async () => {
    fsMock.restore()
  })

  it('should find the instance with its name', async () => {
    const config = await Config.get()
    const instance = LeonInstance.find(config, leonInstance.name)
    expect(instance).toBeDefined()
    expect(instance?.name).toEqual(leonInstance.name)
  })

  it('should not find the instance with wrong name', async () => {
    const config = await Config.get()
    const instance = LeonInstance.find(config, 'wrong name')
    expect(instance).toBeUndefined()
  })
})

describe('services/LeonInstance - get', () => {
  afterEach(async () => {
    fsMock.restore()
  })

  it('should throw if there is no instance', async () => {
    fsMock({
      [Config.FOLDER_PATH]: {}
    })
    await expect(LeonInstance.get()).rejects.toThrowError()
  })

  it('should return the first instance if name is undefined', async () => {
    fsMock({
      [Config.PATH]: JSON.stringify(configData)
    })
    const instance = await LeonInstance.get()
    expect(instance.name).toEqual(leonInstance.name)
  })

  it('should throw if there is no instance with the name specified', async () => {
    fsMock({
      [Config.PATH]: JSON.stringify(configData)
    })
    await expect(LeonInstance.get('wrong name')).rejects.toThrowError()
  })

  it('should return the instance with the name specified', async () => {
    fsMock({
      [Config.PATH]: JSON.stringify(configData)
    })
    const instance = await LeonInstance.get(leonInstance.name)
    expect(instance.name).toEqual(leonInstance.name)
  })
})

describe('services/LeonInstance - create', () => {
  beforeEach(async () => {
    console.error = jest.fn()
    process.exit = jest.fn() as never
  })

  afterEach(async () => {
    fsMock.restore()
    jest.clearAllMocks()
  })

  it('should log the error if the name specified already exists', async () => {
    fsMock({
      [log.path]: {},
      [Config.PATH]: JSON.stringify(configData)
    })
    await expect(async () => {
      await LeonInstance.create(leonCreateOptions)
    }).rejects.toThrowError('This instance name already exists, please choose another name')
  })

  it('should create the new instance', async () => {
    fsMock({
      '/path': {},
      [log.path]: {},
      [Config.FOLDER_PATH]: {}
    })
    await LeonInstance.create(leonCreateOptions)
    const config = await Config.get()
    expect(config.data.instances.length).toEqual(1)
    expect(config.data.instances[0].name).toEqual(leonInstance.name)
  })
})
