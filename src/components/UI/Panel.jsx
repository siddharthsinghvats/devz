import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Panel.module.css'

function Panel({ 
  title, 
  actions, 
  children, 
  className = '',
  expandable = false,
  defaultExpanded = true 
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const toggleExpand = () => {
    if (expandable) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <motion.div
      className={`${styles.panel} ${className} ${!isExpanded && expandable ? styles.collapsed : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {(title || actions || expandable) && (
        <div 
          className={`${styles.header} ${expandable ? styles.expandableHeader : ''}`}
          onClick={expandable ? toggleExpand : undefined}
        >
          <div className={styles.headerLeft}>
            {expandable && (
              <motion.span
                className={styles.expandIcon}
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                ▶
              </motion.span>
            )}
            {title && <h3 className={styles.title}>{title}</h3>}
          </div>
          {actions && <div className={styles.actions} onClick={e => e.stopPropagation()}>{actions}</div>}
        </div>
      )}
      <AnimatePresence initial={false}>
        {(isExpanded || !expandable) && (
          <motion.div 
            className={styles.content}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Panel