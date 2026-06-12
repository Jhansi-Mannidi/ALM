import { motion } from 'framer-motion';
import { fadeUpVariants } from '../motion/presets';

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <motion.div
      className="ph"
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
    >
      <div>
        <div className="ph-title">{title}</div>
        {subtitle != null && subtitle !== '' && <div className="ph-sub">{subtitle}</div>}
      </div>
      {actions ? (
        <motion.div
          className="ph-actions"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12, duration: 0.28 }}
        >
          {actions}
        </motion.div>
      ) : null}
    </motion.div>
  );
}
