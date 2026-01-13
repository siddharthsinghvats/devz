import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Panel, Button, Badge, CodeEditor } from '../UI'
import styles from './Tools.module.css'
import treeStyles from './JsonTree.module.css'

function JsonTreeViewer() {
  const [input, setInput] = useState('')
  const [error, setError] = useState(null)
  const [expandAll, setExpandAll] = useState(false)

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

  const loadSample = () => {
    setInput(JSON.stringify({
      user: {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        profile: {
          avatar: "https://example.com/avatar.jpg",
          bio: "Software Developer",
          social: {
            twitter: "@johndoe",
            github: "johndoe"
          }
        }
      },
      posts: [
        { id: 1, title: "Hello World", tags: ["intro", "first"], published: true },
        { id: 2, title: "Second Post", tags: ["update"], published: false }
      ],
      settings: {
        theme: "dark",
        notifications: true,
        language: "en"
      },
      metadata: null
    }, null, 2))
  }

  const clearAll = () => {
    setInput('')
    setError(null)
  }

  return (
    <motion.div
      className={styles.toolPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className={styles.controls}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={expandAll}
            onChange={(e) => setExpandAll(e.target.checked)}
          />
          <span>Expand all nodes</span>
        </label>
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
                name="root"
                value={parsedJson}
                depth={0}
                expandAll={expandAll}
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

function TreeNode({ name, value, depth = 0, expandAll = false, isRoot = false }) {
  const [isOpen, setIsOpen] = useState(expandAll || depth < 2)

  // Update when expandAll changes
  useMemo(() => {
    if (expandAll) setIsOpen(true)
  }, [expandAll])

  const isObject = value !== null && typeof value === 'object'
  const isArray = Array.isArray(value)
  const entries = isObject ? Object.entries(value) : []
  const isEmpty = entries.length === 0

  const getValueDisplay = () => {
    if (value === null) return <span className={treeStyles.null}>null</span>
    if (typeof value === 'string') return <span className={treeStyles.string}>"{value}"</span>
    if (typeof value === 'number') return <span className={treeStyles.number}>{value}</span>
    if (typeof value === 'boolean') return <span className={treeStyles.boolean}>{String(value)}</span>
    return null
  }

  const getBrackets = () => {
    if (isArray) return ['[', ']']
    return ['{', '}']
  }

  const [openBracket, closeBracket] = getBrackets()

  return (
    <div className={treeStyles.node} style={{ '--depth': depth }}>
      <div
        className={`${treeStyles.row} ${isObject && !isEmpty ? treeStyles.clickable : ''}`}
        onClick={() => isObject && !isEmpty && setIsOpen(!isOpen)}
      >
        {isObject && !isEmpty && (
          <motion.span
            className={treeStyles.arrow}
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.15 }}
          >
            ▶
          </motion.span>
        )}
        {!isObject && <span className={treeStyles.arrowPlaceholder} />}

        {!isRoot && (
          <>
            <span className={treeStyles.key}>{isArray ? '' : `"${name}"`}</span>
            {!isArray && <span className={treeStyles.colon}>: </span>}
          </>
        )}

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
          getValueDisplay()
        )}
      </div>

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
                key={key}
                name={isArray ? index : key}
                value={val}
                depth={depth + 1}
                expandAll={expandAll}
              />
            ))}
            <div className={treeStyles.closing}>
              <span className={treeStyles.bracket}>{closeBracket}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default JsonTreeViewer