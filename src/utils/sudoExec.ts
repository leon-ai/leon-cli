import sudoPrompt from 'sudo-prompt'

import { Leon } from '../services/Leon'

export const sudoExec = async (command: string): Promise<void> => {
  return await new Promise((resolve, reject) => {
    sudoPrompt.exec(
      command,
      {
        name: Leon.NAME
      },
      (error) => {
        if (error != null) {
          reject(error)
        } else {
          resolve()
        }
      }
    )
  })
}
