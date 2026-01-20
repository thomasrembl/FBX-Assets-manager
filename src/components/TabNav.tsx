import { AssetType } from '../types'

interface TabNavProps {
  activeTab: AssetType
  onChange: (tab: AssetType) => void
  counts: {
    assets: number
    textures: number
    stockshots: number
  }
}

export function TabNav({ activeTab, onChange, counts }: TabNavProps) {
  const tabs: { id: AssetType; label: string; count: number }[] = [
    { id: 'assets', label: 'Assets 3D', count: counts.assets },
    { id: 'textures', label: 'Textures', count: counts.textures },
    { id: 'stockshots', label: 'Stockshots', count: counts.stockshots },
  ]

  return (
    <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          {tab.label}
          <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
            activeTab === tab.id
              ? 'bg-primary-foreground/20'
              : 'bg-secondary'
          }`}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  )
}