import os from 'node:os'
import path from 'node:path'

import tap from 'tap'
import mockedEnv from 'mocked-env'

import { requirements } from '../Requirements.js'

await tap.test('services/Requirements - checkVersion', async (t) => {
  await t.test('should return false when there is no match', async (t) => {
    const requirement = '3.7.2'
    const commandAnswer = 'this command does not exist'
    t.equal(requirements.checkVersion(commandAnswer, requirement), false)
    const commandAnswer2 = 'python version is 3.2.0'
    t.equal(requirements.checkVersion(commandAnswer2, requirement), false)
  })

  await t.test(
    'should return false when requirement is wrongly typed',
    async (t) => {
      const requirement = 'wrong requirement'
      const commandAnswer = '3.7.2'
      t.equal(requirements.checkVersion(commandAnswer, requirement), false)
    }
  )

  await t.test(
    'should return true when the version is higher or equal than the requirement',
    async (t) => {
      const requirement = '3.0.0'
      const commandAnswer = '3.7.2'
      t.equal(requirements.checkVersion(commandAnswer, requirement), true)
      const requirement2 = '3.7.2'
      t.equal(requirements.checkVersion(commandAnswer, requirement2), true)
    }
  )
})

await tap.test('services/Requirements - checkPython', async (t) => {
  await t.test('should return a boolean', async () => {
    const result = await requirements.checkPython()
    t.type(result, 'boolean')
  })
})

await tap.test(
  'services/Requirements - checkEnvironmentVariable',
  async (t) => {
    await t.test(
      'should return false because the environment variable is not set',
      async (t) => {
        const restore = mockedEnv({
          PYENV: undefined
        })
        t.equal(
          requirements.checkIfEnvironmentVariableContains(
            'PYENV',
            path.join('.pyenv', 'pyenv-win')
          ),
          false
        )
        restore()
      }
    )

    await t.test(
      "should return false because the environment variable doesn't contains the specifield value",
      async (t) => {
        const restore = mockedEnv({
          PYENV: path.join('some', 'value', 'here')
        })
        t.equal(
          requirements.checkIfEnvironmentVariableContains(
            'PYENV',
            path.join('.pyenv', 'pyenv-win')
          ),
          false
        )
        restore()
      }
    )

    await t.test(
      'should return true because the environment variable contains the specifield value',
      async (t) => {
        const pyenvValue = path.join(os.homedir(), '.pyenv', 'pyenv-win')
        const restore = mockedEnv({
          PYENV: pyenvValue
        })
        t.equal(
          requirements.checkIfEnvironmentVariableContains(
            'PYENV',
            path.join('.pyenv', 'pyenv-win')
          ),
          true
        )
        restore()
      }
    )
  }
)
