import { useState, useEffect } from 'react'

export function WindowControls() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    window.electronAPI.windowIsMaximized().then(setIsMaximized)
  }, [])

  const handleMinimize = () => {
    window.electronAPI.windowMinimize()
  }

  const handleMaximize = () => {
    window.electronAPI.windowMaximize()
    setIsMaximized(!isMaximized)
  }

  const handleClose = () => {
    window.electronAPI.windowClose()
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleMinimize}
        className="w-10 h-10 flex items-center justify-center hover:bg-secondary rounded transition-colors"
      >
        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      <button
        onClick={handleMaximize}
        className="w-10 h-10 flex items-center justify-center hover:bg-secondary rounded transition-colors"
      >
        {isMaximized ? (
          <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="4" y="8" width="12" height="12" strokeWidth={2} rx="1" />
            <path strokeWidth={2} d="M8 8V5a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1h-3" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" strokeWidth={2} rx="1" />
          </svg>
        )}
      </button>

      <button
        onClick={handleClose}
        className="w-10 h-10 flex items-center justify-center hover:bg-red-500 rounded transition-colors group"
      >
        <svg className="w-4 h-4 text-muted-foreground group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}