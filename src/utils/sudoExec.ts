import sudoPrompt from 'sudo-prompt'

import { Leon } from '../services/Leon'

export const sudoExec = async (command: string): Promise<string> => {
  return await new Promise((resolve, reject) => {
    sudoPrompt.exec(
      command,
      {
        name: Leon.NAME
      },
      (error, stdout) => {
        if (error != null) {
          reject(error)
        } else {
          resolve(stdout?.toString() ?? '')
        }
      }
    )
  })
}
