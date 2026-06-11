import { useColors, useSerifFamily } from '@/stores/theme.store'

interface Props {
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  const c = useColors()
  const serif = useSerifFamily()

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: c.paper,
          borderRadius: 20,
          padding: '32px 28px 24px',
          maxWidth: 340,
          width: '88%',
          boxShadow: '0 12px 40px rgba(0,0,0,0.28)',
        }}
      >
        <p style={{
          fontFamily: serif,
          fontSize: 17,
          lineHeight: '26px',
          color: c.ink,
          textAlign: 'center',
          margin: '0 0 28px',
        }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '13px 0', borderRadius: 12,
              border: `1.5px solid ${c.rule}`,
              background: c.paperCard,
              color: c.inkSoft,
              fontSize: 15, fontFamily: serif,
              cursor: 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '13px 0', borderRadius: 12,
              border: 'none',
              background: danger ? '#C0392B' : c.wine,
              color: '#fff',
              fontSize: 15, fontFamily: serif,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
