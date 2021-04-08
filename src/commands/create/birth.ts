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

  async getZip (url: string): Promise<IncomingMessage> {
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

  async installPyenvWindows (): Promise<number> {
    const downloadLoader = ora('Downloading Pyenv for Windows').start()

    const source = 'https://codeload.github.com/pyenv-win/pyenv-win/zip/master'
    const destination = `${os.homedir()}\\.pyenv\\`

    const pyenvZip = await this.getZip(source).catch(() => {
      downloadLoader.stop()
    })

    if (pyenvZip == null) {
      return -1
    }

    if (
      pyenvZip.statusCode != null &&
      (pyenvZip.statusCode < 200 || pyenvZip.statusCode > 299)
    ) {
      downloadLoader.fail()
      console.log(
        `Error ${pyenvZip.statusCode}` + ' while downloading Pyenv for Windows'
      )
      return -1
    }

    downloadLoader.succeed()

    await this.unzipPyenv(pyenvZip, destination)

    const varEnvLoader = ora('Registering environment variables').start()

    try {
      await execa(`setx PYENV ${destination}pyenv-win\\`)
      await execa(
        `setx path "${
          process.env.PATH ?? ''
        };${destination}pyenv-win\\bin;${destination}pyenv-win\\shims`
      )
      varEnvLoader.succeed()
    } catch {
      varEnvLoader.fail()
    }

    return 0
  }

  async execute (): Promise<number> {
    console.log('Hello leon!')
    return 0
  }
}
