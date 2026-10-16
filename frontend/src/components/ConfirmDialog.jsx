import { useEffect, useRef } from 'react';

// Confirmação modal usando o <dialog> nativo (foco preso, Esc fecha, fundo bloqueado).
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Excluir',
  busy = false,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleCancel = (event) => {
    event.preventDefault(); // quem fecha é o estado `open` do pai
    if (!busy) onCancel();
  };

  return (
    <dialog ref={dialogRef} className="dialog" onCancel={handleCancel}>
      <h2>{title}</h2>
      <p>{message}</p>
      <div className="dialog__actions">
        <button type="button" className="btn btn--outline" onClick={onCancel} disabled={busy}>
          Cancelar
        </button>
        <button type="button" className="btn btn--danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Excluindo...' : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
