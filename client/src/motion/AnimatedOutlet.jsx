import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';

export default function AnimatedOutlet({ className = '' }) {
  const outlet = useOutlet();
  const location = useLocation();
  if (!outlet) return null;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        className={className}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}
