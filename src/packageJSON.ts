import { readPackage } from 'read-pkg'

export const packageJSON = await readPackage({
  cwd: new URL('..', import.meta.url)
})
