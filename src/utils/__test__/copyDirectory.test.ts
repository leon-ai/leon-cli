import fs from 'node:fs'

import tap from 'tap'
import fsMock from 'mock-fs'

import { copyDirectory } from '../copyDirectory.js'

await tap.test('utils/copyDirectory', async (t) => {
  t.afterEach(() => {
    fsMock.restore()
  })

  await t.test('copy the files', async (t) => {
    fsMock({
      '/source': {
        'default.png': '',
        'index.ts': ''
      },
      '/destination': {}
    })

    let destinationDirectoryContent = await fs.promises.readdir('/destination')
    let sourceDirectoryContent = await fs.promises.readdir('/source')
    t.equal(destinationDirectoryContent.length, 0)
    t.equal(sourceDirectoryContent.length, 2)

    await copyDirectory('/source', '/destination')
    destinationDirectoryContent = await fs.promises.readdir('/destination')
    sourceDirectoryContent = await fs.promises.readdir('/source')
    t.equal(destinationDirectoryContent.length, 2)
    t.equal(sourceDirectoryContent.length, 2)
    t.strictSame(destinationDirectoryContent, ['default.png', 'index.ts'])
    t.strictSame(sourceDirectoryContent, ['default.png', 'index.ts'])
  })

  await t.test('copy the files and folders recursively', async (t) => {
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
    t.equal(randomFolderContent.length, 2)
    t.equal(secondRandomFolderContent.length, 1)
    t.equal(destinationDirectoryContent.length, 0)
    t.equal(sourceDirectoryContent.length, 2)

    await copyDirectory('/source', '/destination')
    destinationDirectoryContent = await fs.promises.readdir('/destination')
    sourceDirectoryContent = await fs.promises.readdir('/source')
    randomFolderContent = await fs.promises.readdir(
      '/destination/random-folder'
    )
    secondRandomFolderContent = await fs.promises.readdir(
      '/destination/random-folder/second-random-folder'
    )
    t.equal(destinationDirectoryContent.length, 2)
    t.equal(sourceDirectoryContent.length, 2)
    t.strictSame(destinationDirectoryContent, ['index.ts', 'random-folder'])
    t.strictSame(sourceDirectoryContent, ['index.ts', 'random-folder'])
    t.equal(randomFolderContent.length, 2)
    t.equal(secondRandomFolderContent.length, 1)
    t.strictSame(randomFolderContent, ['default.png', 'second-random-folder'])
    t.strictSame(secondRandomFolderContent, ['mycode.ts'])
  })
})
