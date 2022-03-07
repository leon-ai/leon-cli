import os from 'node:os'
import path from 'node:path'

import mockedEnv from 'mocked-env'

import { requirements } from '../Requirements.js'

describe('services/Requirements - checkVersion', () => {
  it('should return false when there is no match', () => {
    const requirement = '3.7.2'
    const commandAnswer = 'this command does not exist'
    expect(requirements.checkVersion(commandAnswer, requirement)).toBe(false)
    const commandAnswer2 = 'python version is 3.2.0'
    expect(requirements.checkVersion(commandAnswer2, requirement)).toBe(false)
  })

  it('should return false when requirement is wrongly typed', () => {
    const requirement = 'wrong requirement'
    const commandAnswer = '3.7.2'
    expect(requirements.checkVersion(commandAnswer, requirement)).toBe(false)
  })

  it('should return true when the version is higher or equal than the requirement', () => {
    const requirement = '3.0.0'
    const commandAnswer = '3.7.2'
    expect(requirements.checkVersion(commandAnswer, requirement)).toBe(true)
    const requirement2 = '3.7.2'
    expect(requirements.checkVersion(commandAnswer, requirement2)).toBe(true)
  })
})

describe('services/Requirements - checkPython', () => {
  it('should return a boolean', async () => {
    const result = await requirements.checkPython()
    expect(typeof result === 'boolean').toBe(true)
  })
})

describe('services/Requirements - checkEnvironmentVariable', () => {
  it('should return false because the environment variable is not set', () => {
    const restore = mockedEnv({
      PYENV: undefined
    })
    expect(
      requirements.checkIfEnvironmentVariableContains(
        'PYENV',
        path.join('.pyenv', 'pyenv-win')
      )
    ).toBe(false)
    restore()
  })

  it("should return false because the environment variable doesn't contains the specifield value", () => {
    const restore = mockedEnv({
      PYENV: path.join('some', 'value', 'here')
    })
    expect(
      requirements.checkIfEnvironmentVariableContains(
        'PYENV',
        path.join('.pyenv', 'pyenv-win')
      )
    ).toBe(false)
    restore()
  })

  it('should return true because the environment variable contains the specifield value', () => {
    const pyenvValue = path.join(os.homedir(), '.pyenv', 'pyenv-win')
    const restore = mockedEnv({
      PYENV: pyenvValue
    })
    expect(
      requirements.checkIfEnvironmentVariableContains(
        'PYENV',
        path.join('.pyenv', 'pyenv-win')
      )
    ).toBe(true)
    restore()
  })
})
