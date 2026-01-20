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
  
  // Images
  getAssetThumbnail: (assetId: string) => ipcRenderer.invoke('get-asset-thumbnail', assetId),
  readImageBase64: (imagePath: string) => ipcRenderer.invoke('read-image-base64', imagePath),

  // Window controls
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),
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
