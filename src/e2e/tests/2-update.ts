import execa from 'execa'

import { LeonInstance } from '../../services/LeonInstance.js'

export const test2Update = (): void => {
  it('leon update', async () => {
    const leonInstance = LeonInstance.get()
    const oldVersion = await leonInstance.getVersion()
    const result = await execa('leon', ['update', '--develop'])
    const newVersion = await leonInstance.getVersion()
    expect(result.exitCode).toEqual(0)
    expect(result.stdout).toContain(
      `Leon instance "${leonInstance.name}" is currently at version ${oldVersion}.`
    )
    expect(result.stdout).toContain(
      `Leon instance "${leonInstance.name}" has now been updated to version ${newVersion}.`
    )
    expect(newVersion.endsWith('+dev')).toBe(true)
    expect(newVersion !== oldVersion).toBe(true)
  })
}
