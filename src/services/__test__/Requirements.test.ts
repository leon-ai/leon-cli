import os from 'node:os'
import path from 'node:path'

import mockedEnv from 'mocked-env'

import { requirements } from '../Requirements.js'

describe('services/Requirements - checkVersion', () => {
  it('should return false when there is no match', async () => {
    const requirement = '3.7.2'
    const commandAnswer = 'this command does not exist'
    expect(
      await requirements.checkVersion(commandAnswer, requirement)
    ).toBeFalsy()
    const commandAnswer2 = 'python version is 3.2.0'
    expect(
      await requirements.checkVersion(commandAnswer2, requirement)
    ).toBeFalsy()
  })

  it('should return false when requirement is wrongly typed', async () => {
    const requirement = 'wrong requirement'
    const commandAnswer = '3.7.2'
    expect(
      await requirements.checkVersion(commandAnswer, requirement)
    ).toBeFalsy()
  })

  it('should return true when the version is higher or equal than the requirement', async () => {
    const requirement = '3.0.0'
    const commandAnswer = '3.7.2'
    expect(await requirements.checkVersion(commandAnswer, requirement)).toBe(
      true
    )
    const requirement2 = '3.7.2'
    expect(await requirements.checkVersion(commandAnswer, requirement2)).toBe(
      true
    )
  })
})

describe('services/Requirements - checkPython', () => {
  it('should return a boolean', async () => {
    const result = await requirements.checkPython()
    expect(typeof result === 'boolean').toBe(true)
  })
})

describe('services/Requirements - checkEnvironmentVariable', () => {
  it('should return false because the environment variable is not set', async () => {
    const restore = mockedEnv({
      PYENV: undefined
    })
    expect(
      await requirements.checkIfEnvironmentVariableContains(
        'PYENV',
        path.join('.pyenv', 'pyenv-win')
      )
    ).toBe(false)
    restore()
  })

  it("should return false because the environment variable doesn't contains the specifield value", async () => {
    const restore = mockedEnv({
      PYENV: path.join('some', 'value', 'here')
    })
    expect(
      await requirements.checkIfEnvironmentVariableContains(
        'PYENV',
        path.join('.pyenv', 'pyenv-win')
      )
    ).toBe(false)
    restore()
  })

  it('should return true because the environment variable contains the specifield value', async () => {
    const pyenvValue = path.join(os.homedir(), '.pyenv', 'pyenv-win')
    const restore = mockedEnv({
      PYENV: pyenvValue
    })
    expect(
      await requirements.checkIfEnvironmentVariableContains(
        'PYENV',
        path.join('.pyenv', 'pyenv-win')
      )
    ).toBe(true)
    restore()
  })
})
