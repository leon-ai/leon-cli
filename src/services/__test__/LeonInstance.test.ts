import tap from 'tap'
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

await tap.test('services/LeonInstance - find', async (t) => {
  t.beforeEach(() => {
    fsMock({
      [config.path]: JSON.stringify(configData)
    })
  })

  t.afterEach(() => {
    fsMock.restore()
  })

  await t.test('should find the instance with its name', async (t) => {
    const instance = LeonInstance.find(leonInstance.name)
    t.not(instance, undefined)
    t.equal(instance?.name, leonInstance.name)
  })

  await t.test('should not find the instance with wrong name', async (t) => {
    const instance = LeonInstance.find('wrong name')
    t.equal(instance, null)
  })
})

await tap.test('services/LeonInstance - get', async (t) => {
  t.afterEach(() => {
    fsMock.restore()
  })

  await t.test('should throw if there is no instance', async (t) => {
    fsMock({
      [config.path]: ''
    })
    t.throws(() => LeonInstance.get())
  })

  await t.test(
    'should return the first instance if name is undefined',
    async (t) => {
      fsMock({
        [config.path]: JSON.stringify(configData)
      })
      const instance = LeonInstance.get()
      t.equal(instance.name, leonInstance.name)
    }
  )

  await t.test(
    'should throw if there is no instance with the name specified',
    async (t) => {
      fsMock({
        [config.path]: JSON.stringify(configData)
      })
      t.throws(() => LeonInstance.get('wrong name'))
    }
  )

  await t.test(
    'should return the instance with the name specified',
    async (t) => {
      fsMock({
        [config.path]: JSON.stringify(configData)
      })
      const instance = LeonInstance.get(leonInstance.name)
      t.equal(instance.name, leonInstance.name)
    }
  )
})
