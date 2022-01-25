import { extractVersionForPath } from '../pythonUtils.js'

describe('utils/pythonUtils', () => {
  it('should return 310 if given "Python 3.10.0b3"', async () => {
    const str = 'Python 3.10.0b3'
    const result = extractVersionForPath(str)
    expect(result).toBe('310')
  })

  it("should return an error if it doesn't exactly have one match", async () => {
    const str1 = 'Python 3.10.0 lorem ipsum 3.7.2'
    expect(() => extractVersionForPath(str1)).toThrowError()
  })
})
