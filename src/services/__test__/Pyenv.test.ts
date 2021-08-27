import { pyenv } from '../Pyenv'

describe('services/Pyenv', () => {
  it('should return the user path', async () => {
    expect(await pyenv.getWindowsUserPath()).not.toBeNull()
  })
})
