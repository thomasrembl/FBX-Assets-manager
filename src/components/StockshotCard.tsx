import { useState, useEffect } from 'react'
import { StockshotAsset } from '../types'

interface StockshotCardProps {
  asset: StockshotAsset
  index: number
  onDownload: (id: string) => void
  onDelete: (id: string) => void
  onRename: (id: string, newName: string) => void
}

export function StockshotCard({ asset, index, onDownload, onDelete, onRename }: StockshotCardProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(asset.name)

  useEffect(() => {
    loadThumbnail()
  }, [asset.id])

  const loadThumbnail = async () => {
    const thumbPath = await window.electronAPI.getStockshotThumbnail(asset.id)
    if (thumbPath) {
      const base64 = await window.electronAPI.readImageBase64(thumbPath)
      setThumbnail(base64)
    } else if (asset.type === 'sequence') {
      // Fallback: charger la frame à 10%
      const framePath = await window.electronAPI.getStockshotFrame(asset.id, 0.1)
      if (framePath) {
        const base64 = await window.electronAPI.readImageBase64(framePath)
        setThumbnail(base64)
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Supprimer "${asset.name}" ?`)) {
      onDelete(asset.id)
    }
  }

  const handleRenameSubmit = () => {
    if (editName.trim() && editName !== asset.name) {
      onRename(asset.id, editName.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit()
    } else if (e.key === 'Escape') {
      setEditName(asset.name)
      setIsEditing(false)
    }
  }

  return (
    <div
      className="group relative rounded-xl border border-border bg-card overflow-hidden opacity-0 animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-secondary overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={asset.name}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-muted-foreground/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Boutons */}
        <div className={`absolute top-3 right-3 flex gap-2 transition-all duration-200 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(asset.id) }}
            className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            title="Télécharger"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setIsEditing(true) }}
            className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            title="Renommer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          <button
            onClick={handleDelete}
            className="p-2 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-colors"
            title="Supprimer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Badge type */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/70 backdrop-blur-sm text-xs text-muted-foreground">
          {asset.type === 'video' ? (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Vidéo
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {asset.frameCount} frames
            </>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => { e.stopPropagation(); setEditName(e.target.value) }}
            onBlur={handleRenameSubmit}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            autoFocus
            className="w-full bg-secondary border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        ) : (
          <h3 className="font-medium text-foreground truncate text-sm">{asset.name}</h3>
        )}
        <p className="text-xs text-muted-foreground mt-1">{formatDate(asset.createdAt)}</p>
      </div>

      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-transform duration-300 origin-left ${isHovered ? 'scale-x-100' : 'scale-x-0'}`} />
    </div>
  )
}