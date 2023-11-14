import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { execa } from 'execa'

import { LeonInstance } from '#src/services/LeonInstance.js'

const TWENTY_MINUTES = 20 * 60 * 1000

export const test2Update = async (): Promise<void> => {
  await test('leon update', { timeout: TWENTY_MINUTES }, async () => {
    const leonInstance = await LeonInstance.get()
    await fs.promises.rm(path.join(leonInstance.path, '.env'), {
      recursive: true,
      force: true
    })
    let oldVersion = await leonInstance.getVersion()
    const leonUpdateWithSameVersion = await execa('leon', ['update'])
    let newVersion = await leonInstance.getVersion()
    assert.strictEqual(leonUpdateWithSameVersion.exitCode, 0)
    assert.strictEqual(
      leonUpdateWithSameVersion.stdout.includes(
        `Leon instance "${leonInstance.name}" is currently at version ${oldVersion}.`
      ),
      true
    )
    assert.strictEqual(
      leonUpdateWithSameVersion.stdout.includes(
        `Leon instance "${leonInstance.name}" is already using the latest version.`
      ),
      true
    )
    assert.strictEqual(newVersion, oldVersion)

    oldVersion = await leonInstance.getVersion()
    const leonUpdate = await execa('leon', ['update', '--develop'])
    newVersion = await leonInstance.getVersion()
    assert.strictEqual(leonUpdate.exitCode, 0)
    assert.strictEqual(
      leonUpdate.stdout.includes(
        `Leon instance "${leonInstance.name}" is currently at version ${oldVersion}.`
      ),
      true
    )
    assert.strictEqual(
      leonUpdate.stdout.includes(
        `Leon instance "${leonInstance.name}" has now been updated to version ${newVersion}.`
      ),
      true
    )
    assert.strictEqual(newVersion.endsWith('+dev'), true)
    assert.notStrictEqual(newVersion, oldVersion)
  })
}
