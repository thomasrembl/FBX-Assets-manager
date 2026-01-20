import { Asset } from '../types'
import { AssetCard } from './AssetCard'

interface AssetGridProps {
  assets: Asset[]
  onDownload: (id: string) => void
  onDelete: (id: string) => void
  onRename: (id: string, newName: string) => void
}

export function AssetGrid({ assets, onDownload, onDelete, onRename }: AssetGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
      {assets.map((asset, index) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          index={index}
          onDownload={onDownload}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </div>
  )
}