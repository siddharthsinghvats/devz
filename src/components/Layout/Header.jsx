import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getToolByPath } from '../../config/tools'
import styles from './Header.module.css'

function Header() {
  const location = useLocation()
  const tool = getToolByPath(location.pathname)

  if (!tool) return null

  return (
    <header className={styles.header}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={styles.content}
      >
        <div className={styles.titleRow}>
          <span
            className={styles.icon}
            style={{ background: tool.color }}
          >
            {tool.icon}
          </span>
          <h1 className={styles.title}>{tool.name}</h1>
        </div>
        <p className={styles.description}>{tool.description}</p>
      </motion.div>
    </header>
  )
}

export default Header