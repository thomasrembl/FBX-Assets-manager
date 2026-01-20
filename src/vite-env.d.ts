/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    // Window controls
    windowMinimize: () => void
    windowMaximize: () => void
    windowClose: () => void
    windowIsMaximized: () => Promise<boolean>
    
    // Assets 3D
    getAssets: () => Promise<import('./types').Asset[]>
    importAsset: () => Promise<import('./types').ImportResult>
    saveAsset: (data: { fbxPath: string; texturePaths: string[]; name: string }) => Promise<import('./types').SaveResult>
    downloadAsset: (assetId: string) => Promise<{ success: boolean; canceled?: boolean; error?: string }>
    deleteAsset: (assetId: string) => Promise<{ success: boolean; error?: string }>
    renameAsset: (assetId: string, newName: string) => Promise<{ success: boolean; error?: string }>
    getAssetThumbnail: (assetId: string) => Promise<string | null>
    readImageBase64: (imagePath: string) => Promise<string | null>
    readFileBase64: (filePath: string) => Promise<string | null>
    saveThumbnail: (assetId: string, dataUrl: string) => Promise<{ success: boolean; path?: string; error?: string }>
    
    // Textures
    getTextures: () => Promise<import('./types').TextureAsset[]>
    importTextures: () => Promise<{ success: boolean; canceled?: boolean; filePaths?: string[]; defaultName?: string }>
    saveTexture: (data: { filePaths: string[]; name: string }) => Promise<import('./types').TextureSaveResult>
    downloadTexture: (id: string) => Promise<{ success: boolean; canceled?: boolean; error?: string }>
    deleteTexture: (id: string) => Promise<{ success: boolean; error?: string }>
    renameTexture: (id: string, newName: string) => Promise<{ success: boolean; error?: string }>
    getTextureThumbnail: (id: string) => Promise<string | null>
    
    // Stockshots
    getStockshots: () => Promise<import('./types').StockshotAsset[]>
    importStockshot: () => Promise<{ success: boolean; canceled?: boolean; filePaths?: string[]; defaultName?: string; type?: 'video' | 'sequence' }>
    saveStockshot: (data: { filePaths: string[]; name: string; type: 'video' | 'sequence' }) => Promise<import('./types').StockshotSaveResult>
    downloadStockshot: (id: string) => Promise<{ success: boolean; canceled?: boolean; error?: string }>
    deleteStockshot: (id: string) => Promise<{ success: boolean; error?: string }>
    renameStockshot: (id: string, newName: string) => Promise<{ success: boolean; error?: string }>
    getStockshotThumbnail: (id: string) => Promise<string | null>
    getStockshotFrame: (id: string, framePercent: number) => Promise<string | null>
    onImportProgress: (callback: (progress: { current: number; total: number; status: string } | null) => void) => void
  }
}