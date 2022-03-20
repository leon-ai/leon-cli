import tap from 'tap'
import waitOn from 'wait-on'
import { execa, ExecaChildProcess } from 'execa'

export const test3Start = async (): Promise<void> => {
  const PORT = 1340
  let startSubprocess: ExecaChildProcess<string> | null = null

  await tap.test('leon start', async (t) => {
    t.teardown(() => {
      startSubprocess?.kill('SIGINT')
    })
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
      t.pass(`Success: Leon is running on http://localhost:${PORT}/`)
      t.end()
    } catch (error: any) {
      t.fail(error)
      t.end()
    }
  })
}
