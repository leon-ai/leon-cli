import fs from 'node:fs'
import path from 'node:path'

import tap from 'tap'
import { execa } from 'execa'

import { LeonInstance } from '../../services/LeonInstance.js'

export const test2Update = async (): Promise<void> => {
  await tap.test('leon update', async (t) => {
    const leonInstance = await LeonInstance.get()
    await fs.promises.rm(path.join(leonInstance.path, '.env'), {
      recursive: true,
      force: true
    })
    let oldVersion = await leonInstance.getVersion()
    const leonUpdateWithSameVersion = await execa('leon', ['update'])
    let newVersion = await leonInstance.getVersion()
    t.equal(leonUpdateWithSameVersion.exitCode, 0)
    t.equal(
      leonUpdateWithSameVersion.stdout.includes(
        `Leon instance "${leonInstance.name}" is currently at version ${oldVersion}.`
      ),
      true
    )
    t.equal(
      leonUpdateWithSameVersion.stdout.includes(
        `Leon instance "${leonInstance.name}" is already using the latest version.`
      ),
      true
    )
    t.equal(newVersion, oldVersion)

    oldVersion = await leonInstance.getVersion()
    const leonUpdate = await execa('leon', ['update', '--develop'])
    newVersion = await leonInstance.getVersion()
    t.equal(leonUpdate.exitCode, 0)
    t.equal(
      leonUpdate.stdout.includes(
        `Leon instance "${leonInstance.name}" is currently at version ${oldVersion}.`
      ),
      true
    )
    t.equal(
      leonUpdate.stdout.includes(
        `Leon instance "${leonInstance.name}" has now been updated to version ${newVersion}.`
      ),
      true
    )
    t.equal(newVersion.endsWith('+dev'), true)
    t.not(newVersion, oldVersion)
  })
}
