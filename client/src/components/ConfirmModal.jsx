import MotionModal from '../motion/MotionModal';
import { AppIcon, Icons } from './icons';

export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message,
  detail,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  busy = false,
  onConfirm,
  onClose,
}) {
  const close = () => {
    if (busy) return;
    onClose();
  };

  const confirmClass =
    variant === 'amber' ? 'btn btn-amber' : variant === 'primary' ? 'btn btn-primary' : 'btn btn-red';

  return (
    <MotionModal
      open={open}
      onClose={close}
      className="confirm-modal-ov"
      modalClassName="confirm-modal"
    >
      <div className="modal-hd" role="alertdialog" aria-labelledby="confirm-modal-title">
        <span className="modal-title" id="confirm-modal-title">
          {title}
        </span>
        <button type="button" className="modal-x" onClick={close} aria-label="Close" disabled={busy}>
          <AppIcon icon={Icons.x} size={16} />
        </button>
      </div>
      <div className="modal-body">
        {message && <p className="confirm-modal-message">{message}</p>}
        {detail && <p className="confirm-modal-detail">{detail}</p>}
      </div>
      <div className="modal-foot confirm-modal-foot">
        <button type="button" className="btn btn-ghost" onClick={close} disabled={busy}>
          {cancelLabel}
        </button>
        <button type="button" className={`${confirmClass} fx g4`} onClick={onConfirm} disabled={busy}>
          <AppIcon icon={variant === 'danger' ? Icons.trash : Icons.check} size={14} />
          {busy ? 'Please wait…' : confirmLabel}
        </button>
      </div>
    </MotionModal>
  );
}
