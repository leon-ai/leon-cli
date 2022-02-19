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
  beforeEach(() => {
    fsMock({
      [config.path]: JSON.stringify(configData)
    })
  })

  afterEach(() => {
    fsMock.restore()
  })

  it('should find the instance with its name', () => {
    const instance = LeonInstance.find(leonInstance.name)
    expect(instance).toBeDefined()
    expect(instance?.name).toEqual(leonInstance.name)
  })

  it('should not find the instance with wrong name', () => {
    const instance = LeonInstance.find('wrong name')
    expect(instance).toBeNull()
  })
})

describe('services/LeonInstance - get', () => {
  afterEach(() => {
    fsMock.restore()
  })

  it('should throw if there is no instance', () => {
    fsMock({
      [config.path]: ''
    })
    expect(() => {
      LeonInstance.get()
    }).toThrowError()
  })

  it('should return the first instance if name is undefined', () => {
    fsMock({
      [config.path]: JSON.stringify(configData)
    })
    const instance = LeonInstance.get()
    expect(instance.name).toEqual(leonInstance.name)
  })

  it('should throw if there is no instance with the name specified', () => {
    fsMock({
      [config.path]: JSON.stringify(configData)
    })
    expect(() => {
      LeonInstance.get('wrong name')
    }).toThrowError()
  })

  it('should return the instance with the name specified', () => {
    fsMock({
      [config.path]: JSON.stringify(configData)
    })
    const instance = LeonInstance.get(leonInstance.name)
    expect(instance.name).toEqual(leonInstance.name)
  })
})
