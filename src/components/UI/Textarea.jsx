import { forwardRef, useState } from 'react'
import { motion } from 'framer-motion'
import styles from './Textarea.module.css'

const Textarea = forwardRef(({
  value,
  onChange,
  placeholder,
  readOnly,
  error,
  label,
  className = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={`${styles.container} ${isFocused ? styles.focused : ''} ${error ? styles.error : ''}`}>
        <textarea
          ref={ref}
          className={styles.textarea}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          spellCheck={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        <div className={styles.glow} />
      </div>
      {value && (
        <motion.div 
          className={styles.stats}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <span>{value.length} chars</span>
          <span>{value.split('\n').length} lines</span>
          <span>{new Blob([value]).size} bytes</span>
        </motion.div>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export default Textarea