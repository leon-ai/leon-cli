import fs from 'node:fs'
import path from 'node:path'

export async function copyDirectory(
  source: string,
  destination: string
): Promise<void> {
  const filesToCreate = await fs.promises.readdir(source)
  for (const file of filesToCreate) {
    const originalFilePath = path.join(source, file)
    const stats = await fs.promises.stat(originalFilePath)
    if (stats.isFile()) {
      const writePath = path.join(destination, file)
      await fs.promises.copyFile(originalFilePath, writePath)
    } else if (stats.isDirectory()) {
      await fs.promises.mkdir(path.join(destination, file))
      await copyDirectory(path.join(source, file), path.join(destination, file))
    }
  }
}
