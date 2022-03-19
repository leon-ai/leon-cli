import execa from 'execa'

import { LeonInstance } from '../../services/LeonInstance.js'

export const test2Update = (): void => {
  test('leon update', async () => {
    const leonInstance = LeonInstance.get()
    let oldVersion = await leonInstance.getVersion()
    const leonUpdateWithSameVersion = await execa('leon', ['update'])
    let newVersion = await leonInstance.getVersion()
    expect(leonUpdateWithSameVersion.exitCode).toEqual(0)
    expect(leonUpdateWithSameVersion.stdout).toContain(
      `Leon instance "${leonInstance.name}" is currently at version ${oldVersion}.`
    )
    expect(leonUpdateWithSameVersion.stdout).toContain(
      `Leon instance "${leonInstance.name}" is already using the latest version.`
    )
    expect(newVersion).toBe(oldVersion)

    oldVersion = await leonInstance.getVersion()
    const leonUpdate = await execa('leon', ['update', '--develop'])
    newVersion = await leonInstance.getVersion()
    expect(leonUpdate.exitCode).toEqual(0)
    expect(leonUpdate.stdout).toContain(
      `Leon instance "${leonInstance.name}" is currently at version ${oldVersion}.`
    )
    expect(leonUpdate.stdout).toContain(
      `Leon instance "${leonInstance.name}" has now been updated to version ${newVersion}.`
    )
    expect(newVersion.endsWith('+dev')).toBe(true)
    expect(newVersion).not.toBe(oldVersion)
  })
}
