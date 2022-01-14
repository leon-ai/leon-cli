import os from 'node:os'

import waitOn from 'wait-on'
import execa from 'execa'

describe('Docker End To End (e2e)', () => {
  it('should brings Leon to life and start the instance', (done) => {
    process.chdir(os.homedir())
    const PORT = 1340
    let startSubprocess: execa.ExecaChildProcess<string> | null = null
    execa('leon', ['create', 'birth', '--docker', '--yes'])
      .then(async ({ stdout, stderr }) => {
        console.log(stdout)
        console.log(stderr)
        startSubprocess = execa('leon', ['start', `--port=${PORT}`])
        return await waitOn({
          resources: [`http-get://localhost:${PORT}/`],
          delay: 1000,
          timeout: 30_000
        })
      })
      .then(() => {
        console.log(`Success: Leon is running on http://localhost:${PORT}/`)
        if (startSubprocess != null) {
          startSubprocess.kill('SIGINT')
        }
        done()
      })
      .catch((error) => {
        if (startSubprocess != null) {
          startSubprocess.kill('SIGINT')
        }
        done(error)
      })
  })
})
