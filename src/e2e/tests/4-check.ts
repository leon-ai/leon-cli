import tap from 'tap'
import { execa } from 'execa'

export const test4Check = async (): Promise<void> => {
  await tap.test('leon check', async (t) => {
    const result = await execa('leon', ['check'])
    t.equal(result.exitCode, 0)
    t.equal(result.stdout.includes('.: CHECKING :.'), true)
  })
}
