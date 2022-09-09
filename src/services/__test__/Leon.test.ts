import tap from 'tap'

import { Leon } from '../Leon.js'

await tap.test('services/Leon', async (t) => {
  await t.test('getSourceCodeInformation', async (t) => {
    await t.test('should return the master version', async (t) => {
      const leon = new Leon({
        useDevelopGitBranch: false
      })
      const sourceCodeInformation = leon.getSourceCodeInformation()
      t.equal(sourceCodeInformation.folderName, `${Leon.NAME}-master`)
      t.equal(sourceCodeInformation.zipName, 'master.zip')
    })

    await t.test('should return the develop version', async (t) => {
      const leon = new Leon({
        useDevelopGitBranch: true
      })
      const sourceCodeInformation = leon.getSourceCodeInformation()
      t.equal(sourceCodeInformation.folderName, `${Leon.NAME}-develop`)
      t.equal(sourceCodeInformation.zipName, 'develop.zip')
    })

    await t.test('should return the 1.0.0 version', async (t) => {
      const leon = new Leon({
        version: '1.0.0'
      })
      const sourceCodeInformation = leon.getSourceCodeInformation()
      t.equal(sourceCodeInformation.folderName, `${Leon.NAME}-1.0.0`)
      t.equal(sourceCodeInformation.zipName, '1.0.0.zip')
    })
  })
})
