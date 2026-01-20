interface EmptyStateProps {
  onImport: () => void
}

export function EmptyState({ onImport }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
      <div className="w-24 h-24 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>

      <h2 className="text-xl font-semibold text-foreground mb-2">
        Aucun asset pour l'instant
      </h2>
      
      <p className="text-muted-foreground mb-6 max-w-sm">
        Importez votre premier asset 3D pour commencer à construire votre bibliothèque.
      </p>

      <button
        onClick={onImport}
        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Importer un asset
      </button>
    </div>
  )
}
