import { useState, useEffect, useMemo } from 'react'
import { Asset, TextureAsset, StockshotAsset, AssetType } from './types'
import { AssetGrid } from './components/AssetGrid'
import { TextureCard } from './components/TextureCard'
import { StockshotCard } from './components/StockshotCard'
import { SearchBar } from './components/SearchBar'
import { ImportModal } from './components/ImportModal'
import { EmptyState } from './components/EmptyState'
import { WindowControls } from './components/WindowControls'
import { TabNav } from './components/TabNav'
import { generateThumbnail } from './utils/thumbnailGenerator'
import { ProgressModal } from './components/ProgressModal'

function App() {
  const [activeTab, setActiveTab] = useState<AssetType>('assets')
  
  // Assets 3D
  const [assets, setAssets] = useState<Asset[]>([])
  
  // Textures
  const [textures, setTextures] = useState<TextureAsset[]>([])
  
  // Stockshots
  const [stockshots, setStockshots] = useState<StockshotAsset[]>([])
  const [importProgress, setImportProgress] = useState<{ current: number; total: number; status: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importData, setImportData] = useState<{
    type: AssetType
    fbxPath?: string
    filePaths?: string[]
    defaultName: string
    stockshotType?: 'video' | 'sequence'
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setIsLoading(true)
    try {
      const [assetsResult, texturesResult, stockshotsResult] = await Promise.all([
        window.electronAPI.getAssets(),
        window.electronAPI.getTextures(),
        window.electronAPI.getStockshots(),
        window.electronAPI.onImportProgress((progress) => {
        setImportProgress(progress)
      })
        
      ])
      setAssets(assetsResult)
      setTextures(texturesResult)
      setStockshots(stockshotsResult)
    } catch (error) {
      console.error('Failed to load:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrage par recherche
  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return assets
    const q = searchQuery.toLowerCase()
    return assets.filter(a => a.name.toLowerCase().includes(q))
  }, [assets, searchQuery])

  const filteredTextures = useMemo(() => {
    if (!searchQuery.trim()) return textures
    const q = searchQuery.toLowerCase()
    return textures.filter(t => t.name.toLowerCase().includes(q))
  }, [textures, searchQuery])

  const filteredStockshots = useMemo(() => {
    if (!searchQuery.trim()) return stockshots
    const q = searchQuery.toLowerCase()
    return stockshots.filter(s => s.name.toLowerCase().includes(q))
  }, [stockshots, searchQuery])

  // Import handlers
  const handleImportClick = async () => {
    if (activeTab === 'assets') {
      const result = await window.electronAPI.importAsset()
      if (result.success && result.fbxPath) {
        setImportData({
          type: 'assets',
          fbxPath: result.fbxPath,
          filePaths: result.texturePaths,
          defaultName: result.defaultName || 'Nouvel Asset',
        })
        setIsImportModalOpen(true)
      }
    } else if (activeTab === 'textures') {
      const result = await window.electronAPI.importTextures()
      if (result.success && result.filePaths) {
        setImportData({
          type: 'textures',
          filePaths: result.filePaths,
          defaultName: result.defaultName || 'Nouvelle Texture',
        })
        setIsImportModalOpen(true)
      }
    } else if (activeTab === 'stockshots') {
      const result = await window.electronAPI.importStockshot()
      if (result.success && result.filePaths) {
        setImportData({
          type: 'stockshots',
          filePaths: result.filePaths,
          defaultName: result.defaultName || 'Nouveau Stockshot',
          stockshotType: result.type,
        })
        setIsImportModalOpen(true)
      }
    }
  }

  const handleSaveAsset = async (name: string) => {
    if (!importData) return

    if (importData.type === 'assets' && importData.fbxPath) {
      const result = await window.electronAPI.saveAsset({
        fbxPath: importData.fbxPath,
        texturePaths: importData.filePaths || [],
        name,
      })
      if (result.success && result.asset) {
        const thumbnailDataUrl = await generateThumbnail(importData.fbxPath)
        if (thumbnailDataUrl) {
          await window.electronAPI.saveThumbnail(result.asset.id, thumbnailDataUrl)
        }
        setAssets(prev => [...prev, result.asset!])
      }
    } else if (importData.type === 'textures' && importData.filePaths) {
      const result = await window.electronAPI.saveTexture({
        filePaths: importData.filePaths,
        name,
      })
      if (result.success && result.asset) {
        setTextures(prev => [...prev, result.asset!])
      }
    } else if (importData.type === 'stockshots' && importData.filePaths && importData.stockshotType) {
      const result = await window.electronAPI.saveStockshot({
        filePaths: importData.filePaths,
        name,
        type: importData.stockshotType,
      })
      if (result.success && result.asset) {
        setStockshots(prev => [...prev, result.asset!])
      }
    }

    setIsImportModalOpen(false)
    setImportData(null)
  }

  // Download handlers
  const handleDownloadAsset = async (id: string) => {
    await window.electronAPI.downloadAsset(id)
  }

  const handleDownloadTexture = async (id: string) => {
    await window.electronAPI.downloadTexture(id)
  }

  const handleDownloadStockshot = async (id: string) => {
    await window.electronAPI.downloadStockshot(id)
  }

  // Delete handlers
  const handleDeleteAsset = async (id: string) => {
    const result = await window.electronAPI.deleteAsset(id)
    if (result.success) {
      setAssets(prev => prev.filter(a => a.id !== id))
    }
  }

  const handleDeleteTexture = async (id: string) => {
    const result = await window.electronAPI.deleteTexture(id)
    if (result.success) {
      setTextures(prev => prev.filter(t => t.id !== id))
    }
  }

  const handleDeleteStockshot = async (id: string) => {
    const result = await window.electronAPI.deleteStockshot(id)
    if (result.success) {
      setStockshots(prev => prev.filter(s => s.id !== id))
    }
  }

  // Rename handlers
  const handleRenameAsset = async (id: string, newName: string) => {
    const result = await window.electronAPI.renameAsset(id, newName)
    if (result.success) {
      setAssets(prev => prev.map(a => a.id === id ? { ...a, name: newName } : a))
    }
  }

  const handleRenameTexture = async (id: string, newName: string) => {
    const result = await window.electronAPI.renameTexture(id, newName)
    if (result.success) {
      setTextures(prev => prev.map(t => t.id === id ? { ...t, name: newName } : t))
    }
  }

  const handleRenameStockshot = async (id: string, newName: string) => {
    const result = await window.electronAPI.renameStockshot(id, newName)
    if (result.success) {
      setStockshots(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s))
    }
  }

  // Current items based on tab
  const getCurrentItems = () => {
    switch (activeTab) {
      case 'assets': return filteredAssets
      case 'textures': return filteredTextures
      case 'stockshots': return filteredStockshots
    }
  }

  const getTotalCount = () => {
    switch (activeTab) {
      case 'assets': return assets.length
      case 'textures': return textures.length
      case 'stockshots': return stockshots.length
    }
  }

  const getImportLabel = () => {
    switch (activeTab) {
      case 'assets': return 'Importer FBX'
      case 'textures': return 'Importer Textures'
      case 'stockshots': return 'Importer Stockshot'
    }
  }

  const renderContent = () => {
    const items = getCurrentItems()
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )
    }

    if (getTotalCount() === 0) {
      return <EmptyState onImport={handleImportClick} />
    }

    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <svg className="w-16 h-16 text-muted-foreground/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-muted-foreground">Aucun résultat pour "{searchQuery}"</p>
        </div>
      )
    }

    if (activeTab === 'assets') {
      return (
        <AssetGrid
          assets={filteredAssets}
          onDownload={handleDownloadAsset}
          onDelete={handleDeleteAsset}
          onRename={handleRenameAsset}
        />
      )
    }

    if (activeTab === 'textures') {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
          {filteredTextures.map((texture, index) => (
            <TextureCard
              key={texture.id}
              asset={texture}
              index={index}
              onDownload={handleDownloadTexture}
              onDelete={handleDeleteTexture}
              onRename={handleRenameTexture}
            />
          ))}
        </div>
      )
    }

    if (activeTab === 'stockshots') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredStockshots.map((stockshot, index) => (
            <StockshotCard
              key={stockshot.id}
              asset={stockshot}
              index={index}
              onDownload={handleDownloadStockshot}
              onDelete={handleDeleteStockshot}
              onRename={handleRenameStockshot}
            />
          ))}
        </div>
      )
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="titlebar-drag flex-shrink-0 h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4">
        <div className="titlebar-no-drag flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground">Asset Manager</h1>
          <TabNav
            activeTab={activeTab}
            onChange={setActiveTab}
            counts={{
              assets: assets.length,
              textures: textures.length,
              stockshots: stockshots.length,
            }}
          />
        </div>

        <div className="titlebar-no-drag flex items-center gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            resultCount={getCurrentItems().length}
            totalCount={getTotalCount()}
          />

          <button
            onClick={handleImportClick}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {getImportLabel()}
          </button>

          <div className="w-px h-6 bg-border" />
          <WindowControls />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto bg-grid p-6">
        {renderContent()}
      </main>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false)
          setImportData(null)
        }}
        onSave={handleSaveAsset}
        defaultName={importData?.defaultName || ''}
        textureCount={importData?.filePaths?.length || 0}
      />
      <ProgressModal progress={importProgress} />
    </div>
  )
}

export default App