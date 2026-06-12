import { AnimatePresence, motion } from 'framer-motion';
import { modalVariants, overlayVariants } from './presets';

export default function MotionModal({ open, onClose, className = '', modalClassName = '', children, style }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`modal-ov open${className ? ` ${className}` : ''}`}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            className={`modal${modalClassName ? ` ${modalClassName}` : ''}`}
            style={style}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
