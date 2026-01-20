interface ProgressModalProps {
  progress: { current: number; total: number; status: string } | null
}

export function ProgressModal({ progress }: ProgressModalProps) {
  if (!progress) return null

  const percent = Math.round((progress.current / progress.total) * 100)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Import en cours...</h2>
        
        <div className="space-y-3">
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{progress.status}</span>
            <span>{percent}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}