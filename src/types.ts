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
export interface ElectronAPI {
  getAssets: () => Promise<Asset[]>
  importAsset: () => Promise<ImportResult>
  saveAsset: (data: { fbxPath: string; texturePaths: string[]; name: string }) => Promise<SaveResult>
  downloadAsset: (assetId: string) => Promise<{ success: boolean; canceled?: boolean; error?: string }>
  deleteAsset: (assetId: string) => Promise<{ success: boolean; error?: string }>
  renameAsset: (assetId: string, newName: string) => Promise<{ success: boolean; error?: string }>
  getAssetThumbnail: (assetId: string) => Promise<string | null>
  readImageBase64: (imagePath: string) => Promise<string | null>
  windowMinimize: () => void
  windowMaximize: () => void
  windowClose: () => void
  windowIsMaximized: () => Promise<boolean>
  saveThumbnail: (assetId: string, dataUrl: string) => Promise<{ success: boolean; path?: string; error?: string }>
  readFileBase64: (filePath: string) => Promise<string | null>
  getTextures: () => Promise<TextureAsset[]>
  importTextures: () => Promise<{ success: boolean; canceled?: boolean; filePaths?: string[]; defaultName?: string }>
  saveTexture: (data: { filePaths: string[]; name: string }) => Promise<TextureSaveResult>
  downloadTexture: (id: string) => Promise<{ success: boolean; canceled?: boolean; error?: string }>
  deleteTexture: (id: string) => Promise<{ success: boolean; error?: string }>
  renameTexture: (id: string, newName: string) => Promise<{ success: boolean; error?: string }>
  getTextureThumbnail: (id: string) => Promise<string | null>
  getStockshots: () => Promise<StockshotAsset[]>
  importStockshot: () => Promise<{ success: boolean; canceled?: boolean; filePaths?: string[]; defaultName?: string; type?: 'video' | 'sequence'; frameCount?: number }>
  saveStockshot: (data: { filePaths: string[]; name: string; type: 'video' | 'sequence' }) => Promise<StockshotSaveResult>
  downloadStockshot: (id: string) => Promise<{ success: boolean; canceled?: boolean; error?: string }>
  deleteStockshot: (id: string) => Promise<{ success: boolean; error?: string }>
  renameStockshot: (id: string, newName: string) => Promise<{ success: boolean; error?: string }>
  getStockshotThumbnail: (id: string) => Promise<string | null>
  getStockshotFrame: (id: string, framePercent: number) => Promise<string | null>
  onUpdateStatus: (callback: (status: string) => void) => void
  onImportProgress: (callback: (progress: { current: number; total: number; status: string } | null) => void) => void
}

