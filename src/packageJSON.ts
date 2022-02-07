import path from 'node:path'

import readPackage from 'read-pkg'

export const packageJSON = readPackage.sync({ cwd: path.join(__dirname, '..') })
