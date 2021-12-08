import os from 'node:os'

import waitOn from 'wait-on'
import execa from 'execa'

describe('Classic End To End (e2e)', () => {
  it('should brings Leon to life and start the instance', (done) => {
    process.chdir(os.homedir())
    let startSubprocess: execa.ExecaChildProcess<string> | null = null
    execa('leon', ['create', 'birth', '--yes'])
      .then(async ({ stdout }) => {
        console.log(stdout)
        startSubprocess = execa('leon', ['start'])
        return await waitOn({
          resources: [`http-get://localhost:1337/`],
          delay: 1000,
          timeout: 480_000
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
