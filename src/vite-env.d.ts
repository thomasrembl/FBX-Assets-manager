/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    getAssets: () => Promise<import('./types').Asset[]>
    importAsset: () => Promise<import('./types').ImportResult>
    saveAsset: (data: { fbxPath: string; texturePaths: string[]; name: string }) => Promise<import('./types').SaveResult>
    downloadAsset: (assetId: string) => Promise<{ success: boolean; canceled?: boolean; error?: string }>
    deleteAsset: (assetId: string) => Promise<{ success: boolean; error?: string }>
    getAssetThumbnail: (assetId: string) => Promise<string | null>
    readImageBase64: (imagePath: string) => Promise<string | null>
    // Window controls
  windowMinimize: () => void
  windowMaximize: () => void
  windowClose: () => void
  windowIsMaximized: () => Promise<boolean>
  }
}
