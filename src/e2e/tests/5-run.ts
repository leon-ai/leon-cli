import tap from 'tap'
import { execa } from 'execa'

export const test5Run = async (): Promise<void> => {
  await tap.test('leon run', async (t) => {
    const result = await execa('leon', ['run', 'train'])
    t.equal(result.exitCode, 0)
  })
}
