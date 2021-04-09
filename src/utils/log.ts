import fs from 'fs'

export const log = {
  path: `${__dirname}/../../logs/errors.log`,

  error (value: string): void {
    const errMessage = 'Not able to log the error'
    const data = `[${new Date().toString()}] ${value}`

    if (!fs.existsSync(this.path)) {
      fs.writeFile(this.path, data, { flag: 'w' }, (err) => {
        if (err != null) console.warn(errMessage, err)
      })
    } else {
      fs.appendFile(this.path, `\n${data}`, (err) => {
        if (err != null) console.warn(errMessage, err)
      })
    }
  }
}
