import test from 'node:test'
import assert from 'node:assert/strict'

import fsMock from 'mock-fs'

import type { ConfigData } from '#src/services/Config.js'
import { config } from '#src/services/Config.js'
import type { LeonInstanceOptions } from '#src/services/LeonInstance.js'
import { LeonInstance } from '#src/services/LeonInstance.js'

const leonInstanceOptions: LeonInstanceOptions = {
  name: 'random-name',
  birthDate: 'birthDate',
  path: '/path'
}

const leonInstance = new LeonInstance(leonInstanceOptions)
const configData: ConfigData = {
  instances: [leonInstance]
}

await test('services/LeonInstance', async (t) => {
  await t.test('find', async (t) => {
    t.afterEach(() => {
      fsMock.restore()
    })

    await t.test('should find the instance with its name', async () => {
      fsMock({
        [config.path]: JSON.stringify(configData),
        [leonInstance.path]: {}
      })
      const instance = await LeonInstance.find(leonInstance.name)
      assert.strictEqual(instance?.name, leonInstance.name)
    })

    await t.test('should not find the instance with wrong name', async () => {
      fsMock({
        [config.path]: JSON.stringify(configData),
        [leonInstance.path]: {}
      })
      const instance = await LeonInstance.find('wrong name')
      assert.strictEqual(instance, null)
    })
  })

  await t.test('get', async (t) => {
    t.afterEach(() => {
      fsMock.restore()
    })

    await t.test('should throw if there is no instance', async () => {
      fsMock({
        [config.path]: ''
      })
      await assert.rejects(async () => {
        return await LeonInstance.get()
      })
    })

    await t.test(
      'should return the first instance if name is undefined',
      async () => {
        fsMock({
          [config.path]: JSON.stringify(configData),
          [leonInstance.path]: {}
        })
        const instance = await LeonInstance.get()
        assert.strictEqual(instance.name, leonInstance.name)
      }
    )

    await t.test(
      'should throw if there is no instance with the name specified',
      async () => {
        fsMock({
          [config.path]: JSON.stringify(configData)
        })
        await assert.rejects(async () => {
          return await LeonInstance.get('wrong name')
        })
      }
    )

    await t.test(
      'should return the instance with the name specified',
      async () => {
        fsMock({
          [config.path]: JSON.stringify(configData),
          [leonInstance.path]: {}
        })
        const instance = await LeonInstance.get(leonInstance.name)
        assert.strictEqual(instance.name, leonInstance.name)
      }
    )
  })
})
