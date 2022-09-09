import os from 'node:os'

const operatingSystemType = os.type()

export const isGNULinux = operatingSystemType === 'Linux'
export const isMacOS = operatingSystemType === 'Darwin'
export const isWindows = operatingSystemType === 'Windows_NT'
