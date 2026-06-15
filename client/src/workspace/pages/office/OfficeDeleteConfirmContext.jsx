import { createContext, useCallback, useContext, useState } from 'react';
import ConfirmModal from '../../../components/ConfirmModal';

const OfficeDeleteConfirmContext = createContext(null);

export function OfficeDeleteConfirmProvider({ children }) {
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);

  const confirmDelete = useCallback((options) => {
    setPending(options);
  }, []);

  const close = () => {
    if (busy) return;
    setPending(null);
  };

  const handleConfirm = async () => {
    if (!pending?.onConfirm) return;
    setBusy(true);
    try {
      await pending.onConfirm();
      setPending(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <OfficeDeleteConfirmContext.Provider value={confirmDelete}>
      {children}
      <ConfirmModal
        open={!!pending}
        title={pending?.title || 'Delete this item?'}
        message={pending ? `Are you sure you want to delete "${pending.label}"?` : ''}
        detail="This action cannot be undone."
        busy={busy}
        onConfirm={handleConfirm}
        onClose={close}
      />
    </OfficeDeleteConfirmContext.Provider>
  );
}

export function useOfficeDeleteConfirm() {
  const confirmDelete = useContext(OfficeDeleteConfirmContext);
  if (!confirmDelete) {
    throw new Error('useOfficeDeleteConfirm must be used within OfficeDeleteConfirmProvider');
  }
  return confirmDelete;
}
