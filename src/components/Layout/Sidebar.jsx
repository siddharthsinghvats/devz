import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toolCategories } from '../../config/tools'
import styles from './Sidebar.module.css'

function Sidebar() {
  const location = useLocation()
  const [expandedCategories, setExpandedCategories] = useState(['json-utils', 'time-utils'])
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const isToolActive = (toolPath) => location.pathname === toolPath

  const isCategoryActive = (category) => {
    return category.tools.some(tool => tool.path === location.pathname)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className={`${styles.mobileMenuBtn} ${isMobileOpen ? styles.open : ''}`}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? '✕' : '☰'}
      </button>

      {/* Overlay */}
      <div
        className={`${styles.overlay} ${isMobileOpen ? styles.visible : ''}`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isMobileOpen ? styles.open : ''}`}>
        {/* Logo */}
        <div className={styles.logo}>
          <motion.div
            className={styles.logoIcon}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
          >
            ⚡
          </motion.div>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>DevTools</span>
            <span className={styles.logoSubtitle}>Developer Utilities</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {toolCategories.map((category) => {
            const isExpanded = expandedCategories.includes(category.id)
            const isActive = isCategoryActive(category)

            return (
              <div key={category.id} className={styles.category}>
                <button
                  className={`${styles.categoryHeader} ${isActive ? styles.categoryActive : ''}`}
                  onClick={() => toggleCategory(category.id)}
                >
                  <span className={styles.categoryIcon}>{category.icon}</span>
                  <span className={styles.categoryTitle}>{category.title}</span>
                  <span className={styles.categoryCount}>{category.tools.length}</span>
                  <motion.span
                    className={styles.categoryArrow}
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ▶
                  </motion.span>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.ul
                      className={styles.toolList}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      {category.tools.map((tool) => {
                        const active = isToolActive(tool.path)
                        return (
                          <li key={tool.path}>
                            <NavLink
                              to={tool.path}
                              className={`${styles.toolLink} ${active ? styles.active : ''}`}
                            >
                              <span
                                className={styles.toolIcon}
                                style={{
                                  background: active ? tool.color : 'transparent',
                                  borderColor: tool.color,
                                }}
                              >
                                {tool.icon}
                              </span>
                              <span className={styles.toolName}>{tool.name}</span>
                              {active && (
                                <motion.div
                                  className={styles.activeBar}
                                  layoutId="activeSidebarItem"
                                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                              )}
                            </NavLink>
                          </li>
                        )
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.version}>v1.0.0</span>
          <a
            href="https://github.com/siddharthsinghvats/devz"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            ⭐ GitHub
          </a>
        </div>
      </aside>
    </>
  )
}

export default Sidebar