import { InstallPyenv } from '../InstallPyenv'

describe('installPyenv', () => {
  it('should return the user path', async () => {
    const install = new InstallPyenv()

    const value = await install.getWindowsUserPath()
    expect(value).not.toBeNull()
  })
})
