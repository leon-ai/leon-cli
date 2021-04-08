import fs from 'fs'
import https from 'https'
import { IncomingMessage } from 'http'
import os from 'os'
import path from 'path'

import { Command } from 'clipanion'
import execa from 'execa'
import ora from 'ora'
import unzipper, { Entry } from 'unzipper'

export class CreateBirthCommand extends Command {
  static paths = [['create', 'birth']]

  async getAsync (url: string): Promise<IncomingMessage> {
    return await new Promise((resolve, reject) => {
      https
        .get(url, (response: IncomingMessage) => {
          resolve(response)
        })
        .on('error', (error: Error) => {
          reject(error)
        })
    })
  }

  async downloadPyenvWindows (url: string): Promise<IncomingMessage | undefined> {
    const downloadLoader = ora('Downloading Pyenv for Windows').start()

    const pyenvZip = await this.getAsync(url).catch(() => {
      downloadLoader.stop()
    })

    if (pyenvZip == null) {
      return
    }

    if (
      pyenvZip.statusCode != null &&
      (pyenvZip.statusCode < 200 || pyenvZip.statusCode > 299)
    ) {
      downloadLoader.fail()
      console.log(
        `Error ${pyenvZip.statusCode}` + ' while downloading Pyenv for Windows'
      )
      return
    }

    downloadLoader.succeed()

    return pyenvZip
  }

  async unzipPyenv (
    streamZip: IncomingMessage,
    destination: string
  ): Promise<void> {
    return await new Promise((resolve, reject) => {
      const unzipLoader = ora('Unzipping Pyenv').start()

      streamZip
        .pipe(unzipper.Parse())
        .on('entry', (entry: Entry) => {
          if (entry.type === 'Directory') return entry.autodrain()

          // all files are contained into a main folder, pyenv-windows only requires the files within
          const filePath = path.join(
            destination,
            entry.path.replace('pyenv-win-master/', '')
          )

          // directories doesn't exists yet, recursive creation ensures that the structure is correct
          fs.mkdirSync(path.dirname(filePath), { recursive: true })

          entry.pipe(fs.createWriteStream(filePath))
        })
        .on('error', (err) => {
          unzipLoader.fail()
          console.log('Error while unzipping Pyenv for Windows')
          console.log(err)
          reject(err)
        })
        .on('close', () => {
          unzipLoader.succeed()
          resolve()
        })
    })
  }

  async registerPyenvEnv (pyenvPath: string): Promise<void> {
    const varEnvLoader = ora('Registering environment variables').start()

    try {
      await execa(`setx PYENV ${pyenvPath}pyenv-win\\`)
      await execa(
        `setx path "${
          process.env.PATH ?? ''
        };${pyenvPath}pyenv-win\\bin;${pyenvPath}pyenv-win\\shims`
      )
      varEnvLoader.succeed()
    } catch {
      varEnvLoader.fail()
    }
  }

  async installPyenvWindows (): Promise<number> {
    const source = 'https://codeload.github.com/pyenv-win/pyenv-win/zip/master'
    const destination = `${os.homedir()}\\.pyenv\\`

    const pyenvZip = await this.downloadPyenvWindows(source)

    if (pyenvZip == null) {
      return -1
    }

    await this.unzipPyenv(pyenvZip, destination)

    await this.registerPyenvEnv(destination)

    return 0
  }

  async execute (): Promise<number> {
    await this.installPyenvWindows()

    return 0
  }
}
