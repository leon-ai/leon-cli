import test from 'node:test'
import assert from 'node:assert/strict'

import waitOn from 'wait-on'
import type { ExecaChildProcess } from 'execa'
import { execa } from 'execa'
import terminate from 'terminate'

export const test3Start = async (): Promise<void> => {
  const PORT = 1340
  let startSubprocess: ExecaChildProcess<string> | null = null

  await test('leon start', async () => {
    startSubprocess = execa('leon', ['start', `--port=${PORT}`], {
      windowsHide: false,
      shell: true
    })
    try {
      await waitOn({
        resources: [`http-get://127.0.0.1:${PORT}/`],
        delay: 10_000,
        timeout: 600_000
      })
      terminate(startSubprocess.pid ?? 0, 'SIGINT', { timeout: 10_000 }, () => {
        terminate(startSubprocess?.pid ?? 0)
      })
      assert.ok(true, `Success: Leon is running on http://127.0.0.1:${PORT}/`)
    } catch (error: any) {
      terminate(startSubprocess.pid ?? 0, 'SIGINT', { timeout: 10_000 }, () => {
        terminate(startSubprocess?.pid ?? 0)
      })
      assert.fail(error)
    }
  })
}
