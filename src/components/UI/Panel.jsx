import { motion } from 'framer-motion'
import styles from './Panel.module.css'

function Panel({ title, actions, children, className = '' }) {
  return (
    <motion.div
      className={`${styles.panel} ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {(title || actions) && (
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </motion.div>
  )
}

export default Panel