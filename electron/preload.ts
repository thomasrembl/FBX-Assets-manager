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

  // thumbnail generation
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
  // Progress listener
  onImportProgress: (callback: (progress: { current: number; total: number; status: string } | null) => void) => {
    ipcRenderer.on('import-progress', (_event, progress) => callback(progress))
},
})

// Types pour TypeScript côté renderer
export interface ElectronAPI {
  getAssets: () => Promise<Asset[]>
  importAsset: () => Promise<ImportResult>
  saveAsset: (data: { fbxPath: string; texturePaths: string[]; name: string }) => Promise<SaveResult>
  downloadAsset: (assetId: string) => Promise<{ success: boolean; canceled?: boolean; error?: string }>
  deleteAsset: (assetId: string) => Promise<{ success: boolean; error?: string }>
  getAssetThumbnail: (assetId: string) => Promise<string | null>
  readImageBase64: (imagePath: string) => Promise<string | null>
}

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

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
