import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Panel, Button, Badge, CodeEditor } from '../UI'
import styles from './Tools.module.css'
import treeStyles from './JsonTree.module.css'

function JsonTreeViewer() {
  const [input, setInput] = useState('')
  const [error, setError] = useState(null)
  const [expandAll, setExpandAll] = useState(false)
  const [expandKey, setExpandKey] = useState(0) // Force re-render when expandAll changes

  const parsedJson = useMemo(() => {
    if (!input.trim()) {
      setError(null)
      return null
    }
    try {
      const parsed = JSON.parse(input)
      setError(null)
      return parsed
    } catch (e) {
      setError(e.message)
      return null
    }
  }, [input])

  // Force re-render of tree when expandAll changes
  useEffect(() => {
    setExpandKey(prev => prev + 1)
  }, [expandAll])

  const loadSample = () => {
    setInput(JSON.stringify({
      user: {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        profile: {
          avatar: "https://example.com/avatar.jpg",
          bio: "Software Developer with 10 years of experience in building web applications",
          social: {
            twitter: "@johndoe",
            github: "johndoe",
            linkedin: "johndoe"
          }
        }
      },
      posts: [
        { id: 1, title: "Hello World", tags: ["intro", "first"], published: true },
        { id: 2, title: "Learning React", tags: ["react", "javascript"], published: false },
        { id: 3, title: "Advanced TypeScript Patterns for Enterprise Applications", tags: ["typescript", "advanced"], published: true }
      ],
      settings: {
        theme: "dark",
        notifications: true,
        language: "en",
        timezone: "America/New_York"
      },
      metadata: null,
      scores: [98, 87, 92, 78, 95]
    }, null, 2))
  }

  const clearAll = () => {
    setInput('')
    setError(null)
  }

  const toggleExpandAll = () => {
    setExpandAll(prev => !prev)
  }

  return (
    <motion.div
      className={styles.toolPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className={styles.controls}>
        <Button 
          size="small" 
          variant={expandAll ? 'primary' : 'ghost'} 
          onClick={toggleExpandAll}
        >
          {expandAll ? '📂 Collapse All' : '📁 Expand All'}
        </Button>
        <div className={styles.controlActions}>
          <Button size="small" variant="ghost" onClick={loadSample}>📄 Sample</Button>
          <Button size="small" variant="ghost" onClick={clearAll}>🗑️ Clear</Button>
        </div>
      </div>

      <div className={styles.gridAuto}>
        <Panel title="Input JSON">
          <CodeEditor
            value={input}
            onChange={setInput}
            placeholder="Paste your JSON here..."
            error={!!error}
          />
        </Panel>

        <Panel
          title="Tree View"
          actions={
            parsedJson && (
              <Badge variant="info">
                {typeof parsedJson === 'object' && parsedJson !== null
                  ? Array.isArray(parsedJson)
                    ? `Array [${parsedJson.length}]`
                    : `Object {${Object.keys(parsedJson).length}}`
                  : typeof parsedJson
                }
              </Badge>
            )
          }
        >
          <div className={treeStyles.treeContainer}>
            {error ? (
              <div className={treeStyles.error}>
                <span className={treeStyles.errorIcon}>✗</span>
                <span>{error}</span>
              </div>
            ) : parsedJson !== null ? (
              <TreeNode
                key={expandKey}
                name="root"
                value={parsedJson}
                depth={0}
                defaultExpanded={expandAll}
                isRoot
              />
            ) : (
              <div className={treeStyles.placeholder}>
                Enter valid JSON to see the tree view
              </div>
            )}
          </div>
        </Panel>
      </div>
    </motion.div>
  )
}

function TreeNode({ name, value, depth = 0, defaultExpanded = false, isRoot = false }) {
  const [isOpen, setIsOpen] = useState(defaultExpanded || depth < 2)

  // Update when defaultExpanded changes
  useEffect(() => {
    setIsOpen(defaultExpanded || depth < 2)
  }, [defaultExpanded, depth])

  const isObject = value !== null && typeof value === 'object'
  const isArray = Array.isArray(value)
  const entries = isObject ? Object.entries(value) : []
  const isEmpty = entries.length === 0

  const toggleOpen = () => {
    if (isObject && !isEmpty) {
      setIsOpen(!isOpen)
    }
  }

  const renderValue = () => {
    if (value === null) {
      return <span className={treeStyles.null}>null</span>
    }
    if (typeof value === 'string') {
      // Truncate very long strings for display
      const displayValue = value.length > 100 ? value.substring(0, 100) + '...' : value
      return <span className={treeStyles.string} title={value}>"{displayValue}"</span>
    }
    if (typeof value === 'number') {
      return <span className={treeStyles.number}>{value}</span>
    }
    if (typeof value === 'boolean') {
      return <span className={treeStyles.boolean}>{String(value)}</span>
    }
    return null
  }

  const getBrackets = () => isArray ? ['[', ']'] : ['{', '}']
  const [openBracket, closeBracket] = getBrackets()

  return (
    <div className={treeStyles.node}>
      <div
        className={`${treeStyles.row} ${isObject && !isEmpty ? treeStyles.clickable : ''}`}
        onClick={toggleOpen}
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        {/* Arrow */}
        {isObject && !isEmpty ? (
          <motion.span
            className={treeStyles.arrow}
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.15 }}
          >
            ▶
          </motion.span>
        ) : (
          <span className={treeStyles.arrowPlaceholder} />
        )}

        {/* Key */}
        {!isRoot && (
          <span className={treeStyles.keyWrapper}>
            {isArray ? (
              <span className={treeStyles.index}>{name}</span>
            ) : (
              <span className={treeStyles.key}>"{name}"</span>
            )}
            <span className={treeStyles.colon}>:</span>
          </span>
        )}

        {/* Value */}
        <span className={treeStyles.valueWrapper}>
          {isObject ? (
            <span className={treeStyles.preview}>
              <span className={treeStyles.bracket}>{openBracket}</span>
              {isEmpty ? (
                <span className={treeStyles.bracket}>{closeBracket}</span>
              ) : !isOpen ? (
                <>
                  <span className={treeStyles.ellipsis}>...</span>
                  <span className={treeStyles.bracket}>{closeBracket}</span>
                </>
              ) : null}
              <span className={treeStyles.count}>
                {isArray ? `${entries.length} items` : `${entries.length} keys`}
              </span>
            </span>
          ) : (
            renderValue()
          )}
        </span>
      </div>

      {/* Children */}
      <AnimatePresence>
        {isObject && !isEmpty && isOpen && (
          <motion.div
            className={treeStyles.children}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {entries.map(([key, val], index) => (
              <TreeNode
                key={`${key}-${index}`}
                name={isArray ? index : key}
                value={val}
                depth={depth + 1}
                defaultExpanded={defaultExpanded}
              />
            ))}
            <div className={treeStyles.closing} style={{ paddingLeft: `${depth * 20}px` }}>
              <span className={treeStyles.bracket}>{closeBracket}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default JsonTreeViewer