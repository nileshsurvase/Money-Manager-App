import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  loading = false, 
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  fullWidth = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props 
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-target';
  
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl focus:ring-orange-500 dark:focus:ring-orange-400',
    secondary: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md hover:bg-white/90 dark:hover:bg-gray-700/90 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl focus:ring-gray-500',
    accent: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 focus:ring-gray-500 rounded-lg',
    success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl focus:ring-green-500',
  };
  
  const sizes = {
    small: 'text-sm px-3 py-2 min-h-[36px]',
    medium: 'text-sm sm:text-base px-4 py-2.5 sm:px-6 sm:py-3 min-h-[40px] sm:min-h-[44px]',
    large: 'text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 min-h-[48px] sm:min-h-[52px]',
  };

  const buttonClass = `${baseClasses} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

  const buttonVariants = {
    initial: { scale: 1 },
    hover: disabled || loading ? {} : { scale: 1.02 },
    tap: disabled || loading ? {} : { scale: 0.98 },
  };

  return (
    <motion.button
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="spinner mr-2 flex-shrink-0" />
      )}
      <span className="flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};

export default Button; 