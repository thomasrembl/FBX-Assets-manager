import { useState, useEffect } from 'react'
import { Asset } from '../types'

interface AssetCardProps {
  asset: Asset
  index: number
  onDownload: (id: string) => void
  onDelete: (id: string) => void
}

export function AssetCard({ asset, index, onDownload, onDelete }: AssetCardProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    loadThumbnail()
  }, [asset.id])

  const loadThumbnail = async () => {
    const thumbPath = await window.electronAPI.getAssetThumbnail(asset.id)
    if (thumbPath) {
      const base64 = await window.electronAPI.readImageBase64(thumbPath)
      setThumbnail(base64)
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

  return (
    <div
      className="group relative rounded-xl border border-border bg-card overflow-hidden opacity-0 animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square bg-secondary overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={asset.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-muted-foreground/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}

        {/* Overlay au hover */}
        <div className={`absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Bouton download au hover */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDownload(asset.id)
          }}
          className={`absolute top-3 right-3 p-2 rounded-lg bg-primary text-primary-foreground transition-all duration-200 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
          title="Télécharger"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>

        {/* Badge texture count */}
        {asset.textureCount > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/70 backdrop-blur-sm text-xs text-muted-foreground">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {asset.textureCount}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-foreground truncate text-sm">
          {asset.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDate(asset.createdAt)}
        </p>
      </div>

      {/* Ligne d'accent au hover */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-transform duration-300 origin-left ${isHovered ? 'scale-x-100' : 'scale-x-0'}`} />
    </div>
  )
}
