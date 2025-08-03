import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

// Ultra-optimized Card component for butter smooth performance
const OptimizedCard = memo(({ 
  children, 
  className = '', 
  hover = true, 
  padding = 'default',
  variant = 'default',
  onClick,
  animate = true,
  ...props 
}) => {
  // Memoized class calculations with minimal re-renders
  const cardClasses = useMemo(() => {
    const paddingMap = {
      none: '',
      small: 'p-3 sm:p-4',
      default: 'p-4 sm:p-6',
      large: 'p-6 sm:p-8',
    };

    const variantMap = {
      default: 'card',
      compact: 'card-compact',
      large: 'card-large',
      glass: 'glass-card p-4 sm:p-6',
      stat: 'stat-card',
    };

    const baseClass = variant !== 'default' 
      ? variantMap[variant] 
      : `card ${paddingMap[padding]}`;
    
    return `${baseClass} ${className} ${onClick ? 'cursor-pointer' : ''}`;
  }, [variant, padding, className, onClick]);

  // Ultra smooth animation variants - optimized for 60fps
  const motionVariants = useMemo(() => ({
    initial: { opacity: 0, y: 8, scale: 0.98 },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.5,
        duration: 0.25
      }
    },
    hover: hover ? { 
      y: -2, 
      scale: 1.01,
      transition: { 
        type: "spring", 
        stiffness: 800, 
        damping: 25,
        mass: 0.3
      }
    } : {},
    tap: onClick ? { 
      scale: 0.98,
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 800, 
        damping: 25,
        mass: 0.3,
        duration: 0.1
      }
    } : {},
  }), [hover, onClick]);

  // For static cards (better performance when animation not needed)
  if (!animate) {
    return (
      <div
        className={cardClasses}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      variants={motionVariants}
      className={cardClasses}
      onClick={onClick}
      style={{
        // Force hardware acceleration for smooth animations
        willChange: hover || onClick ? 'transform' : 'auto',
        transform: 'translateZ(0)', // Force GPU layer
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

OptimizedCard.displayName = 'OptimizedCard';

export default OptimizedCard;