import { createContext, useCallback, useContext, useState } from 'react';
import ConfirmModal from '../../../components/ConfirmModal';

const PmDeleteConfirmContext = createContext(null);

export function PmDeleteConfirmProvider({ children }) {
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
    <PmDeleteConfirmContext.Provider value={confirmDelete}>
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
    </PmDeleteConfirmContext.Provider>
  );
}

export function usePmDeleteConfirm() {
  const confirmDelete = useContext(PmDeleteConfirmContext);
  if (!confirmDelete) {
    throw new Error('usePmDeleteConfirm must be used within PmDeleteConfirmProvider');
  }
  return confirmDelete;
}
