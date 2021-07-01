import os from 'os'
import path from 'path'

import mockedEnv from 'mocked-env'

import {
  checkEnvironmentVariable,
  checkPyenv,
  checkPython,
  checkVersion
} from '../Requirements'

describe('services/Requirements - checkVersion', () => {
  it('should return false when there is no match', async () => {
    const requirement = '3.7.2'

    const commandAnswer = 'this command does not exist'

    expect(await checkVersion(commandAnswer, requirement)).toBeFalsy()

    const commandAnswer2 = 'python version is 3.2.0'

    expect(await checkVersion(commandAnswer2, requirement)).toBeFalsy()
  })

  it('should return false when requirement is wrongly typed', async () => {
    const requirement = 'wrong requirement'

    const commandAnswer = '3.7.2'

    expect(await checkVersion(commandAnswer, requirement)).toBeFalsy()
  })

  it('should return true when the version is higher or equal than the requirement', async () => {
    const requirement = '3.0.0'

    const commandAnswer = '3.7.2'

    expect(await checkVersion(commandAnswer, requirement)).toBeTruthy()

    const requirement2 = '3.7.2'

    expect(await checkVersion(commandAnswer, requirement2)).toBeTruthy()
  })
})

describe('services/Requirements - checkPython', () => {
  it('should return a boolean', async () => {
    const result = await checkPython()
    expect(typeof result === 'boolean').toBeTruthy()
  })
})

describe('services/Requirements - checkPyenv', () => {
  it('should return a boolean', async () => {
    const result = await checkPyenv()
    expect(typeof result === 'boolean').toBeTruthy()
  })
})

describe('services/Requirements - checkEnvironmentVariable', () => {
  it('should return false because the environment variable is not set', async () => {
    const restore = mockedEnv({
      PYENV: undefined
    })

    expect(
      await checkEnvironmentVariable('PYENV', path.join('.pyenv', 'pyenv-win'))
    ).toBe(false)

    restore()
  })

  it("should return false because the environment variable doesn't contains the specifield value", async () => {
    const restore = mockedEnv({
      PYENV: path.join('some', 'value', 'here')
    })

    expect(
      await checkEnvironmentVariable('PYENV', path.join('.pyenv', 'pyenv-win'))
    ).toBe(false)

    restore()
  })

  it('should return true because the environment variable contains the specifield value', async () => {
    const pyenvValue = path.join(os.homedir(), '.pyenv', 'pyenv-win')

    const restore = mockedEnv({
      PYENV: pyenvValue
    })

    expect(
      await checkEnvironmentVariable('PYENV', path.join('.pyenv', 'pyenv-win'))
    ).toBe(true)

    restore()
  })
})
