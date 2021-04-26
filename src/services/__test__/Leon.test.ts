import { Leon } from '../Leon'

describe('services/Leon - getSourceCodeInformation', () => {
  it('should return the master version', () => {
    const leon = new Leon({
      useDevelopGitBranch: false
    })
    const sourceCodeInformation = leon.getSourceCodeInformation()
    expect(sourceCodeInformation.folderName).toEqual(`${Leon.NAME}-master`)
    expect(sourceCodeInformation.zipName).toEqual('master.zip')
  })

  it('should return the develop version', () => {
    const leon = new Leon({
      useDevelopGitBranch: true
    })
    const sourceCodeInformation = leon.getSourceCodeInformation()
    expect(sourceCodeInformation.folderName).toEqual(`${Leon.NAME}-develop`)
    expect(sourceCodeInformation.zipName).toEqual('develop.zip')
  })

  it('should return the 1.0.0 version', () => {
    const leon = new Leon({
      version: '1.0.0'
    })
    const sourceCodeInformation = leon.getSourceCodeInformation()
    expect(sourceCodeInformation.folderName).toEqual(`${Leon.NAME}-1.0.0`)
    expect(sourceCodeInformation.zipName).toEqual('1.0.0.zip')
  })
})
