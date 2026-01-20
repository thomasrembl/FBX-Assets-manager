export interface Asset {
  id: string
  name: string
  fbxFileName: string
  textureCount: number
  createdAt: string
  thumbnailPath: string | null
}

export interface TextureAsset {
  id: string
  name: string
  files: string[]
  fileCount: number
  createdAt: string
  thumbnailPath: string | null
}

export interface StockshotAsset {
  id: string
  name: string
  type: 'video' | 'sequence'
  files: string[]
  frameCount: number
  createdAt: string
  thumbnailPath: string | null
}

export type AssetType = 'assets' | 'textures' | 'stockshots'

export interface ImportResult {
  success: boolean
  canceled?: boolean
  fbxPath?: string
  texturePaths?: string[]
  defaultName?: string
}

export interface SaveResult {
  success: boolean
  asset?: Asset
  error?: string
}

export interface TextureSaveResult {
  success: boolean
  asset?: TextureAsset
  error?: string
}

export interface StockshotSaveResult {
  success: boolean
  asset?: StockshotAsset
  error?: string
}