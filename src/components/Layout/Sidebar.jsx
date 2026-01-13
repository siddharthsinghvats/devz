import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toolCategories } from '../../config/tools'
import styles from './Sidebar.module.css'

function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation()
  const [expandedCategories, setExpandedCategories] = useState(['json-utils', 'time-utils'])
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (mobile) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [setIsOpen])

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false)
    }
  }, [location.pathname, isMobile, setIsOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, isMobile])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

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
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
        {/* Toggle Button Inside Sidebar */}
        <button
          className={styles.toggleBtn}
          onClick={toggleSidebar}
          aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isOpen ? '✕' : '☰'}
        </button>

        <div className={styles.sidebarContent}>
          {/* Logo */}
          <div className={styles.logo}>
            <motion.div
              className={styles.logoIcon}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
            >
              ⚡
            </motion.div>
            {isOpen && (
              <div className={styles.logoText}>
                <span className={styles.logoTitle}>DevTools</span>
                <span className={styles.logoSubtitle}>Developer Utilities</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          {isOpen && (
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
          )}

          {/* Footer */}
          {isOpen && (
            <div className={styles.footer}>
              <span className={styles.version}>v1.0.0</span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                ⭐ GitHub
              </a>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar