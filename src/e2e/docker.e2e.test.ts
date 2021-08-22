import os from 'os'

import waitOn from 'wait-on'
import execa from 'execa'

describe('Docker End To End (e2e)', () => {
  it('should brings Leon to life and start the instance', (done) => {
    process.chdir(os.homedir())
    const PORT = 1337
    let startSubprocess: execa.ExecaChildProcess<string> | null = null
    execa('leon', ['create', 'birth', '--docker', '--develop'])
      .then(async ({ stdout }) => {
        console.log(stdout)
        startSubprocess = execa('leon', ['start', `--port=${PORT}`])
        return await waitOn({
          resources: [`http-get://localhost:${PORT}/`],
          delay: 1000,
          timeout: 30_000
        })
      })
      .then(() => {
        done()
      })
      .catch((error) => {
        done(error)
      })
      .finally(() => {
        if (startSubprocess != null) {
          startSubprocess.kill('SIGINT')
        }
      })
  })
})
