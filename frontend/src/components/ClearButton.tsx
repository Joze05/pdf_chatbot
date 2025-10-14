interface ClearButtonProps {
  onClick: () => void
}

export default function ClearButton({ onClick }: ClearButtonProps) {
  return (
    <button onClick={onClick} className="clear-button" title="Limpiar conversación">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
    </button>
  )
}
