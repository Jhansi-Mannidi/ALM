import { motion } from 'framer-motion';
import { springSnappy, staggerItem } from './presets';

export default function MotionCard({ className, children, onClick, ...props }) {
  return (
    <motion.div
      className={className}
      variants={staggerItem}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, scale: 1.015, transition: springSnappy }}
      whileTap={{ scale: 0.985, transition: { duration: 0.1 } }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionInteractive({ className, children, onClick, ...props }) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -3, scale: 1.012, transition: springSnappy }}
      whileTap={{ scale: 0.985, transition: { duration: 0.1 } }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}
