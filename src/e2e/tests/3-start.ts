import tap from 'tap'
import waitOn from 'wait-on'
import type { ExecaChildProcess } from 'execa'
import { execa } from 'execa'
import terminate from 'terminate'

export const test3Start = async (): Promise<void> => {
  const PORT = 1340
  let startSubprocess: ExecaChildProcess<string> | null = null

  await tap.test('leon start', async (t) => {
    startSubprocess = execa('leon', ['start', `--port=${PORT}`], {
      windowsHide: false,
      shell: true
    })
    try {
      await waitOn({
        resources: [`http-get://localhost:${PORT}/`],
        delay: 1000,
        timeout: 480_000
      })
      terminate(startSubprocess.pid ?? 0, 'SIGINT', { timeout: 10000 }, () => {
        terminate(startSubprocess?.pid ?? 0)
      })
      t.pass(`Success: Leon is running on http://localhost:${PORT}/`)
    } catch (error: any) {
      terminate(startSubprocess.pid ?? 0, 'SIGINT', { timeout: 10000 }, () => {
        terminate(startSubprocess?.pid ?? 0)
      })
      t.fail(error)
    }
  })
}
