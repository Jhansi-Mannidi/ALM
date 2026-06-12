import { Children, isValidElement } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from './presets';

export function MotionStagger({ className, children, as = 'div' }) {
  const Component = motion[as] || motion.div;

  return (
    <Component
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {Children.toArray(children)
        .filter((child) => child != null && child !== false)
        .map((child, index) => (
          <motion.div key={isValidElement(child) && child.key != null ? child.key : index} variants={staggerItem}>
            {child}
          </motion.div>
        ))}
    </Component>
  );
}

export function MotionItem({ className, children, delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
