import tap from 'tap'
import waitOn from 'wait-on'
import { execa, ExecaChildProcess } from 'execa'

export const test3Start = async (): Promise<void> => {
  const PORT = 1340

  await tap.test('leon start', async (t) => {
    let startSubprocess: ExecaChildProcess<string> | null = null
    startSubprocess = execa('leon', ['start', `--port=${PORT}`], {
      stdio: 'inherit',
      windowsHide: false
    })
    try {
      await waitOn({
        resources: [`http-get://localhost:${PORT}/`],
        delay: 1000,
        timeout: 480_000
      })
      t.equal(startSubprocess?.kill('SIGINT'), true)
      t.pass(`Success: Leon is running on http://localhost:${PORT}/`)
    } catch (error: any) {
      t.equal(startSubprocess?.kill('SIGINT'), true)
      t.fail(error)
    }
  })
}
