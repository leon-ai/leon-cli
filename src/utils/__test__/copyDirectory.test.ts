import fs from 'node:fs'

import fsMock from 'mock-fs'

import { copyDirectory } from '../copyDirectory.js'

describe('utils/copyDirectory', () => {
  afterEach(async () => {
    fsMock.restore()
  })

  it('copy the files', async () => {
    fsMock({
      '/source': {
        'default.png': '',
        'index.ts': ''
      },
      '/destination': {}
    })

    let destinationDirectoryContent = await fs.promises.readdir('/destination')
    let sourceDirectoryContent = await fs.promises.readdir('/source')
    expect(destinationDirectoryContent.length).toEqual(0)
    expect(sourceDirectoryContent.length).toEqual(2)

    await copyDirectory('/source', '/destination')
    destinationDirectoryContent = await fs.promises.readdir('/destination')
    sourceDirectoryContent = await fs.promises.readdir('/source')
    expect(destinationDirectoryContent.length).toEqual(2)
    expect(sourceDirectoryContent.length).toEqual(2)
    expect(destinationDirectoryContent).toEqual(
      expect.arrayContaining(['default.png', 'index.ts'])
    )
    expect(sourceDirectoryContent).toEqual(
      expect.arrayContaining(['default.png', 'index.ts'])
    )
  })

  it('copy the files and folders recursively', async () => {
    fsMock({
      '/source': {
        'random-folder': {
          'default.png': '',
          'second-random-folder': {
            'mycode.ts': ''
          }
        },
        'index.ts': ''
      },
      '/destination': {}
    })

    let destinationDirectoryContent = await fs.promises.readdir('/destination')
    let sourceDirectoryContent = await fs.promises.readdir('/source')
    let randomFolderContent = await fs.promises.readdir('/source/random-folder')
    let secondRandomFolderContent = await fs.promises.readdir(
      '/source/random-folder/second-random-folder'
    )
    expect(randomFolderContent.length).toEqual(2)
    expect(secondRandomFolderContent.length).toEqual(1)
    expect(destinationDirectoryContent.length).toEqual(0)
    expect(sourceDirectoryContent.length).toEqual(2)

    await copyDirectory('/source', '/destination')
    destinationDirectoryContent = await fs.promises.readdir('/destination')
    sourceDirectoryContent = await fs.promises.readdir('/source')
    randomFolderContent = await fs.promises.readdir(
      '/destination/random-folder'
    )
    secondRandomFolderContent = await fs.promises.readdir(
      '/destination/random-folder/second-random-folder'
    )
    expect(destinationDirectoryContent.length).toEqual(2)
    expect(sourceDirectoryContent.length).toEqual(2)
    expect(destinationDirectoryContent).toEqual(
      expect.arrayContaining(['random-folder', 'index.ts'])
    )
    expect(sourceDirectoryContent).toEqual(
      expect.arrayContaining(['random-folder', 'index.ts'])
    )
    expect(randomFolderContent.length).toEqual(2)
    expect(secondRandomFolderContent.length).toEqual(1)
    expect(randomFolderContent).toEqual(
      expect.arrayContaining(['default.png', 'second-random-folder'])
    )
    expect(secondRandomFolderContent).toEqual(
      expect.arrayContaining(['mycode.ts'])
    )
  })
})
