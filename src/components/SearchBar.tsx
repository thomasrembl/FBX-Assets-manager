interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  resultCount: number
  totalCount: number
}

export function SearchBar({ value, onChange, resultCount, totalCount }: SearchBarProps) {
  const showCount = value.trim() && resultCount !== totalCount

  return (
    <div className="relative flex items-center">
      <div className="relative">
        <svg 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        
        <input
          type="text"
          placeholder="Rechercher..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-64 h-9 pl-9 pr-9 bg-secondary/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />

        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-secondary transition-colors"
          >
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {showCount && (
        <span className="ml-3 text-xs text-muted-foreground">
          {resultCount} résultat{resultCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}
