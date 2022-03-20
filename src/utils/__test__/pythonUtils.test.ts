import tap from 'tap'

import { extractVersionForPath } from '../pythonUtils.js'

await tap.test('utils/pythonUtils', async (t) => {
  await t.test('should return 310 if given "Python 3.10.0b3"', async (t) => {
    const str = 'Python 3.10.0b3'
    const result = extractVersionForPath(str)
    t.equal(result, '310')
  })

  await t.test(
    "should return an error if it doesn't exactly have one match",
    async (t) => {
      const str1 = 'Python 3.10.0 lorem ipsum 3.7.2'
      t.throws(() => extractVersionForPath(str1))
    }
  )
})
