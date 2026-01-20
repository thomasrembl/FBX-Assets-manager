import { useState, useEffect, useMemo } from 'react'
import { Asset } from './types'
import { AssetGrid } from './components/AssetGrid'
import { SearchBar } from './components/SearchBar'
import { ImportModal } from './components/ImportModal'
import { EmptyState } from './components/EmptyState'
import { WindowControls } from './components/WindowControls'

function App() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importData, setImportData] = useState<{
    fbxPath: string
    texturePaths: string[]
    defaultName: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Charger les assets au démarrage
  useEffect(() => {
    loadAssets()
  }, [])

  const loadAssets = async () => {
    setIsLoading(true)
    try {
      const result = await window.electronAPI.getAssets()
      setAssets(result)
    } catch (error) {
      console.error('Failed to load assets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrer les assets par recherche
  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return assets
    const query = searchQuery.toLowerCase()
    return assets.filter(asset => 
      asset.name.toLowerCase().includes(query)
    )
  }, [assets, searchQuery])

  // Lancer l'import
  const handleImportClick = async () => {
    const result = await window.electronAPI.importAsset()
    
    if (result.success && result.fbxPath) {
      setImportData({
        fbxPath: result.fbxPath,
        texturePaths: result.texturePaths || [],
        defaultName: result.defaultName || 'Nouvel Asset',
      })
      setIsImportModalOpen(true)
    }
  }

  // Sauvegarder l'asset importé
  const handleSaveAsset = async (name: string) => {
    if (!importData) return

    const result = await window.electronAPI.saveAsset({
      fbxPath: importData.fbxPath,
      texturePaths: importData.texturePaths,
      name,
    })

    if (result.success && result.asset) {
      setAssets(prev => [...prev, result.asset!])
    }

    setIsImportModalOpen(false)
    setImportData(null)
  }

  // Télécharger un asset
  const handleDownload = async (assetId: string) => {
    await window.electronAPI.downloadAsset(assetId)
  }

  // Supprimer un asset
  const handleDelete = async (assetId: string) => {
    const result = await window.electronAPI.deleteAsset(assetId)
    if (result.success) {
      setAssets(prev => prev.filter(a => a.id !== assetId))
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header / Titlebar */}
      <header className="titlebar-drag flex-shrink-0 h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {/* Espace pour les boutons macOS */}
          <div className="w-20 hidden md:block" />
          
          <h1 className="text-lg font-semibold text-foreground">
            Asset Manager
          </h1>
          
          <span className="text-sm text-muted-foreground">
            {assets.length} asset{assets.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="titlebar-no-drag flex items-center gap-3">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery}
            resultCount={filteredAssets.length}
            totalCount={assets.length}
          />
          
          <button
            onClick={handleImportClick}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Importer
          </button>
        <div className="w-px h-6 bg-border" />
        <WindowControls />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto bg-grid p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : assets.length === 0 ? (
          <EmptyState onImport={handleImportClick} />
        ) : filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="w-16 h-16 text-muted-foreground/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-muted-foreground">Aucun résultat pour "{searchQuery}"</p>
          </div>
        ) : (
          <AssetGrid 
            assets={filteredAssets} 
            onDownload={handleDownload}
            onDelete={handleDelete}
          />
        )}
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
        textureCount={importData?.texturePaths.length || 0}
      />
    </div>
  )
}

export default App
