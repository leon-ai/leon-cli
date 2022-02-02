import fsMock from 'mock-fs'

import { ConfigData, config } from '../Config.js'
import { LeonInstance, LeonInstanceOptions } from '../LeonInstance.js'

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

describe('services/LeonInstance - find', () => {
  beforeEach(async () => {
    fsMock({
      [config.path]: JSON.stringify(configData)
    })
  })

  afterEach(async () => {
    fsMock.restore()
  })

  it('should find the instance with its name', async () => {
    const instance = LeonInstance.find(leonInstance.name)
    expect(instance).toBeDefined()
    expect(instance?.name).toEqual(leonInstance.name)
  })

  it('should not find the instance with wrong name', async () => {
    const instance = LeonInstance.find('wrong name')
    expect(instance).toBeNull()
  })
})

describe('services/LeonInstance - get', () => {
  afterEach(async () => {
    fsMock.restore()
  })

  it('should throw if there is no instance', async () => {
    fsMock({
      [config.path]: ''
    })
    await expect(LeonInstance.get()).rejects.toThrowError()
  })

  it('should return the first instance if name is undefined', async () => {
    fsMock({
      [config.path]: JSON.stringify(configData)
    })
    const instance = await LeonInstance.get()
    expect(instance.name).toEqual(leonInstance.name)
  })

  it('should throw if there is no instance with the name specified', async () => {
    fsMock({
      [config.path]: JSON.stringify(configData)
    })
    await expect(LeonInstance.get('wrong name')).rejects.toThrowError()
  })

  it('should return the instance with the name specified', async () => {
    fsMock({
      [config.path]: JSON.stringify(configData)
    })
    const instance = await LeonInstance.get(leonInstance.name)
    expect(instance.name).toEqual(leonInstance.name)
  })
})
