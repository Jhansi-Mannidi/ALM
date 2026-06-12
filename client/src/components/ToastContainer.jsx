import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { toastVariants } from '../motion/presets';

const ICONS = { ok: '✓', err: '✗', warn: '⚠' };

export default function ToastContainer() {
  const { toasts = [] } = useApp();
  return (
    <div className="toast-wrap">
      <AnimatePresence initial={false}>
        {(toasts ?? []).map((t) => (
          <motion.div
            key={t.id}
            className={`toast${t.type ? ` ${t.type}` : ''}`}
            layout
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <span>{ICONS[t.type] || 'ℹ'}</span>
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
