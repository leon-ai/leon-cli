import { requirements } from '../Requirements'

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
    expect(
      await requirements.checkVersion(commandAnswer, requirement)
    ).toBeTruthy()
    const requirement2 = '3.7.2'
    expect(
      await requirements.checkVersion(commandAnswer, requirement2)
    ).toBeTruthy()
  })
})

describe('services/Requirements - checkPython', () => {
  it('should return a boolean', async () => {
    const result = await requirements.checkPython()
    expect(typeof result === 'boolean').toBeTruthy()
  })
})
