import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import styles from './Button.module.css'

const Button = forwardRef(({
  children,
  variant = 'default',
  size = 'default',
  icon,
  iconRight,
  isLoading,
  disabled,
  fullWidth,
  className = '',
  ...props
}, ref) => {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    isLoading && styles.loading,
    className,
  ].filter(Boolean).join(' ')

  return (
    <motion.button
      ref={ref}
      className={classes}
      disabled={disabled || isLoading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {isLoading && (
        <span className={styles.spinner}>
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="12">
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
            </circle>
          </svg>
        </span>
      )}
      {icon && !isLoading && <span className={styles.icon}>{icon}</span>}
      <span className={styles.text}>{children}</span>
      {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
    </motion.button>
  )
})

Button.displayName = 'Button'

export default Button