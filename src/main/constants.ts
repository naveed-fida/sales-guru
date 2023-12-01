import path from 'path'
import { app } from 'electron'

export const isDev = process.env.NODE_ENV === 'development'
export const dbPath = path.join(app.getPath('userData'), 'app.db')
export const dbUrl = isDev ? 'file:./dev.db' : 'file:' + dbPath

process.env.DATABASE_URL = dbUrl

// This needs to be updated every time you create a migration!
export const latestMigration = '20231130153138_change_ints_to_floats'
export const platformToExecutables: any = {
  win32: {
    migrationEngine: 'node_modules/@prisma/engines/migration-engine-windows.exe',
    queryEngine: 'node_modules/@prisma/engines/query_engine-windows.dll.node',
  },
  linux: {
    migrationEngine: 'node_modules/@prisma/engines/schema-engine-debian-openssl-1.1.x',
    queryEngine: 'node_modules/@prisma/engines/libquery_engine-debian-openssl-1.1.x.so.node',
  },
  darwin: {
    migrationEngine: 'node_modules/@prisma/engines/schema-engine-darwin',
    queryEngine: 'node_modules/@prisma/engines/libquery_engine-darwin.dylib.node',
  },
  darwinArm64: {
    migrationEngine: 'node_modules/@prisma/engines/schema-engine-darwin-arm64',
    queryEngine: 'node_modules/@prisma/engines/libquery_engine-darwin-arm64.dylib.node',
  },
}
const extraResourcesPath = app.getAppPath().replace('app.asar', '') // impacted by extraResources setting in electron-builder.yml

function getPlatformName(): string {
  const isDarwin = process.platform === 'darwin'
  if (isDarwin && process.arch === 'arm64') {
    return process.platform + 'Arm64'
  }

  return process.platform
}

const platformName = getPlatformName()

export const mePath = path.join(
  extraResourcesPath,
  platformToExecutables[platformName].migrationEngine,
)
export const qePath = path.join(extraResourcesPath, platformToExecutables[platformName].queryEngine)

export interface Migration {
  id: string
  checksum: string
  finished_at: string
  migration_name: string
  logs: string
  rolled_back_at: string
  started_at: string
  applied_steps_count: string
}
