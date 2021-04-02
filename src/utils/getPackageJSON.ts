import * as fsWithCallbacks from 'fs'
import path from 'path'

interface ObjectAny {
  [key: string]: any
}

interface PackageJSON extends ObjectAny {
  name: string
  version: string
}

const fs = fsWithCallbacks.promises

const PACKAGE_JSON_PATH = path.join(__dirname, '..', '..', 'package.json')

export const getPackageJSON = async (): Promise<PackageJSON> => {
  const fileContent = await fs.readFile(PACKAGE_JSON_PATH, {
    encoding: 'utf-8'
  })
  return JSON.parse(fileContent)
}
