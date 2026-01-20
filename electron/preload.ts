import { contextBridge, ipcRenderer } from 'electron'

// Exposer les APIs au renderer de manière sécurisée
contextBridge.exposeInMainWorld('electronAPI', {
  // Assets
  getAssets: () => ipcRenderer.invoke('get-assets'),
  importAsset: () => ipcRenderer.invoke('import-asset'),
  saveAsset: (data: { fbxPath: string; texturePaths: string[]; name: string }) => 
    ipcRenderer.invoke('save-asset', data),
  downloadAsset: (assetId: string) => ipcRenderer.invoke('download-asset', assetId),
  deleteAsset: (assetId: string) => ipcRenderer.invoke('delete-asset', assetId),
  renameAsset: (assetId: string, newName: string) => 
    ipcRenderer.invoke('rename-asset', assetId, newName),
  
  // Images
  getAssetThumbnail: (assetId: string) => ipcRenderer.invoke('get-asset-thumbnail', assetId),
  readImageBase64: (imagePath: string) => ipcRenderer.invoke('read-image-base64', imagePath),

  // Window controls
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  // Thumbnail generation
  saveThumbnail: (assetId: string, dataUrl: string) => 
    ipcRenderer.invoke('save-thumbnail', assetId, dataUrl),
  readFileBase64: (filePath: string) => ipcRenderer.invoke('read-file-base64', filePath),

  // Textures
  getTextures: () => ipcRenderer.invoke('get-textures'),
  importTextures: () => ipcRenderer.invoke('import-textures'),
  saveTexture: (data: { filePaths: string[]; name: string }) => 
    ipcRenderer.invoke('save-texture', data),
  downloadTexture: (id: string) => ipcRenderer.invoke('download-texture', id),
  deleteTexture: (id: string) => ipcRenderer.invoke('delete-texture', id),
  renameTexture: (id: string, newName: string) => 
    ipcRenderer.invoke('rename-texture', id, newName),
  getTextureThumbnail: (id: string) => ipcRenderer.invoke('get-texture-thumbnail', id),

  // Stockshots
  getStockshots: () => ipcRenderer.invoke('get-stockshots'),
  importStockshot: () => ipcRenderer.invoke('import-stockshot'),
  saveStockshot: (data: { filePaths: string[]; name: string; type: 'video' | 'sequence' }) => 
    ipcRenderer.invoke('save-stockshot', data),
  downloadStockshot: (id: string) => ipcRenderer.invoke('download-stockshot', id),
  deleteStockshot: (id: string) => ipcRenderer.invoke('delete-stockshot', id),
  renameStockshot: (id: string, newName: string) => 
    ipcRenderer.invoke('rename-stockshot', id, newName),
  getStockshotThumbnail: (id: string) => ipcRenderer.invoke('get-stockshot-thumbnail', id),
  getStockshotFrame: (id: string, framePercent: number) => 
    ipcRenderer.invoke('get-stockshot-frame', id, framePercent),

  // Listeners
  onUpdateStatus: (callback: (status: string) => void) => {
    ipcRenderer.on('update-status', (_event, status) => callback(status))
  },
  onImportProgress: (callback: (progress: { current: number; total: number; status: string } | null) => void) => {
    ipcRenderer.on('import-progress', (_event, progress) => callback(progress))
  },
})

// Types
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

export interface ElectronAPI {
  // Assets
  getAssets: () => Promise<Asset[]>
  importAsset: () => Promise<ImportResult>
  saveAsset: (data: { fbxPath: string; texturePaths: string[]; name: string }) => Promise<SaveResult>
  downloadAsset: (assetId: string) => Promise<{ success: boolean; canceled?: boolean; error?: string }>
  deleteAsset: (assetId: string) => Promise<{ success: boolean; error?: string }>
  renameAsset: (assetId: string, newName: string) => Promise<{ success: boolean; error?: string }>
  getAssetThumbnail: (assetId: string) => Promise<string | null>
  readImageBase64: (imagePath: string) => Promise<string | null>
  
  // Window
  windowMinimize: () => void
  windowMaximize: () => void
  windowClose: () => void
  windowIsMaximized: () => Promise<boolean>
  
  // Thumbnail
  saveThumbnail: (assetId: string, dataUrl: string) => Promise<{ success: boolean; path?: string; error?: string }>
  readFileBase64: (filePath: string) => Promise<string | null>
  
  // Textures
  getTextures: () => Promise<TextureAsset[]>
  importTextures: () => Promise<{ success: boolean; canceled?: boolean; filePaths?: string[]; defaultName?: string }>
  saveTexture: (data: { filePaths: string[]; name: string }) => Promise<{ success: boolean; asset?: TextureAsset; error?: string }>
  downloadTexture: (id: string) => Promise<{ success: boolean; canceled?: boolean; error?: string }>
  deleteTexture: (id: string) => Promise<{ success: boolean; error?: string }>
  renameTexture: (id: string, newName: string) => Promise<{ success: boolean; error?: string }>
  getTextureThumbnail: (id: string) => Promise<string | null>
  
  // Stockshots
  getStockshots: () => Promise<StockshotAsset[]>
  importStockshot: () => Promise<{ success: boolean; canceled?: boolean; filePaths?: string[]; defaultName?: string; type?: 'video' | 'sequence'; frameCount?: number }>
  saveStockshot: (data: { filePaths: string[]; name: string; type: 'video' | 'sequence' }) => Promise<{ success: boolean; asset?: StockshotAsset; error?: string }>
  downloadStockshot: (id: string) => Promise<{ success: boolean; canceled?: boolean; error?: string }>
  deleteStockshot: (id: string) => Promise<{ success: boolean; error?: string }>
  renameStockshot: (id: string, newName: string) => Promise<{ success: boolean; error?: string }>
  getStockshotThumbnail: (id: string) => Promise<string | null>
  getStockshotFrame: (id: string, framePercent: number) => Promise<string | null>
  
  // Listeners
  onUpdateStatus: (callback: (status: string) => void) => void
  onImportProgress: (callback: (progress: { current: number; total: number; status: string } | null) => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}