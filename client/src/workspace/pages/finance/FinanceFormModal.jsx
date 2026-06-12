import MotionModal from '../../../motion/MotionModal';
import { AppIcon, Icons } from '../../../components/icons';

export default function FinanceFormModal({
  open,
  title,
  onClose,
  onSubmit,
  saving = false,
  submitLabel = 'Save',
  children,
  wide = false,
}) {
  return (
    <MotionModal
      open={open}
      onClose={() => !saving && onClose?.()}
      modalClassName={`ws-fin-form-modal${wide ? ' wide' : ''}`}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.(e);
        }}
      >
        <div className="modal-hd">
          <span className="modal-title">{title}</span>
          <button type="button" className="modal-x" onClick={onClose} disabled={saving} aria-label="Close">
            <AppIcon icon={Icons.x} size={16} />
          </button>
        </div>
        <div className="modal-body ws-fin-form-modal-body">{children}</div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="ws-hr-btn-primary" disabled={saving}>
            {saving ? 'Saving…' : submitLabel}
          </button>
        </div>
      </form>
    </MotionModal>
  );
}
