export interface Asset {
  id: string
  name: string
  fbxFileName: string
  textureCount: number
  createdAt: string
  thumbnailPath: string | null
}

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
