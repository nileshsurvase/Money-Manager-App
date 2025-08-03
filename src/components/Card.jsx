import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';
import { cardAnimation, hardwareAcceleration } from '../utils/performance';

const Card = memo(({ 
  children, 
  className = '', 
  hover = true, 
  padding = 'default',
  variant = 'default',
  onClick,
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    small: 'p-3 sm:p-4',
    default: 'p-4 sm:p-6',
    large: 'p-6 sm:p-8',
  };

  const variantClasses = {
    default: 'card',
    compact: 'card-compact',
    large: 'card-large',
    glass: 'glass-card p-4 sm:p-6',
    stat: 'stat-card',
  };

  const cardClass = useMemo(() => {
    const baseClass = variant !== 'default' ? variantClasses[variant] : `card ${paddingClasses[padding]}`;
    return `${baseClass} ${className}`;
  }, [variant, padding, className, variantClasses, paddingClasses]);

  const variants = useMemo(() => ({
    ...cardAnimation,
    hover: hover ? { 
      y: -4, 
      scale: 1.02,
      ...hardwareAcceleration,
      transition: { type: "spring", stiffness: 400, damping: 25 }
    } : {},
    tap: onClick ? { 
      scale: 0.98,
      transition: { type: "spring", stiffness: 600, damping: 30 }
    } : {},
  }), [hover, onClick]);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      variants={variants}
      className={`${cardClass} perf-card perf-60fps ${onClick ? 'cursor-pointer perf-touch' : ''}`}
      onClick={onClick}
      style={hardwareAcceleration}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

export default Card; 