import tap from 'tap'
import fsMock from 'mock-fs'

import type { ConfigData } from '../Config.js'
import { config } from '../Config.js'
import type { LeonInstanceOptions } from '../LeonInstance.js'
import { LeonInstance } from '../LeonInstance.js'

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

await tap.test('services/LeonInstance', async (t) => {
  await t.test('find', async (t) => {
    t.afterEach(() => {
      fsMock.restore()
    })

    await t.test('should find the instance with its name', async (t) => {
      fsMock({
        [config.path]: JSON.stringify(configData),
        [leonInstance.path]: {}
      })
      const instance = await LeonInstance.find(leonInstance.name)
      t.equal(instance?.name, leonInstance.name)
    })

    await t.test('should not find the instance with wrong name', async (t) => {
      fsMock({
        [config.path]: JSON.stringify(configData),
        [leonInstance.path]: {}
      })
      const instance = await LeonInstance.find('wrong name')
      t.equal(instance, null)
    })
  })

  await t.test('get', async (t) => {
    t.afterEach(() => {
      fsMock.restore()
    })

    await t.test('should throw if there is no instance', async (t) => {
      fsMock({
        [config.path]: ''
      })
      await t.rejects(async () => {
        return await LeonInstance.get()
      })
    })

    await t.test(
      'should return the first instance if name is undefined',
      async (t) => {
        fsMock({
          [config.path]: JSON.stringify(configData),
          [leonInstance.path]: {}
        })
        const instance = await LeonInstance.get()
        t.equal(instance.name, leonInstance.name)
      }
    )

    await t.test(
      'should throw if there is no instance with the name specified',
      async (t) => {
        fsMock({
          [config.path]: JSON.stringify(configData)
        })
        await t.rejects(async () => {
          return await LeonInstance.get('wrong name')
        })
      }
    )

    await t.test(
      'should return the instance with the name specified',
      async (t) => {
        fsMock({
          [config.path]: JSON.stringify(configData),
          [leonInstance.path]: {}
        })
        const instance = await LeonInstance.get(leonInstance.name)
        t.equal(instance.name, leonInstance.name)
      }
    )
  })
})
