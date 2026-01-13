import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Panel, Button, Badge, CodeEditor } from '../UI'
import styles from './Tools.module.css'

function JsonValidator() {
  const [input, setInput] = useState('')
  const [isValid, setIsValid] = useState(null)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)
  const [liveMode, setLiveMode] = useState(true)

  useEffect(() => {
    if (liveMode && input.trim()) {
      validate()
    } else if (!input.trim()) {
      setIsValid(null)
      setError(null)
      setStats(null)
    }
  }, [input, liveMode])

  const validate = () => {
    if (!input.trim()) {
      toast.error('Please enter JSON to validate')
      return
    }

    try {
      const parsed = JSON.parse(input)
      setIsValid(true)
      setError(null)
      setStats(analyzeJson(parsed))
      if (!liveMode) toast.success('Valid JSON!')
    } catch (err) {
      setIsValid(false)
      setStats(null)
      setError(parseError(err.message, input))
      if (!liveMode) toast.error('Invalid JSON')
    }
  }

  const analyzeJson = (obj) => {
    const result = { objects: 0, arrays: 0, strings: 0, numbers: 0, booleans: 0, nulls: 0, keys: 0 }

    const traverse = (val) => {
      if (val === null) result.nulls++
      else if (Array.isArray(val)) {
        result.arrays++
        val.forEach(traverse)
      } else if (typeof val === 'object') {
        result.objects++
        result.keys += Object.keys(val).length
        Object.values(val).forEach(traverse)
      } else if (typeof val === 'string') result.strings++
      else if (typeof val === 'number') result.numbers++
      else if (typeof val === 'boolean') result.booleans++
    }

    traverse(obj)
    return result
  }

  const parseError = (message, json) => {
    const match = message.match(/position (\d+)/)
    if (match) {
      const pos = parseInt(match[1])
      const lines = json.substring(0, pos).split('\n')
      return { message, line: lines.length, column: lines[lines.length - 1].length + 1 }
    }
    return { message }
  }

  const loadBadSample = () => {
    setInput('{\n  "name": "John",\n  "age": 30,\n  "city": "New York"\n')
  }

  const clearAll = () => {
    setInput('')
    setIsValid(null)
    setError(null)
    setStats(null)
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
            checked={liveMode}
            onChange={(e) => setLiveMode(e.target.checked)}
          />
          <span>Live validation</span>
        </label>
        <div className={styles.controlActions}>
          <Button size="small" variant="ghost" onClick={loadBadSample}>
            ⚠️ Bad Sample
          </Button>
          <Button size="small" variant="ghost" onClick={clearAll}>
            🗑️ Clear
          </Button>
        </div>
      </div>

      <Panel
        title="JSON Input"
        actions={
          isValid !== null && (
            <Badge variant={isValid ? 'success' : 'error'}>
              {isValid ? '✓ Valid JSON' : '✗ Invalid JSON'}
            </Badge>
          )
        }
      >
        <CodeEditor
          value={input}
          onChange={setInput}
          placeholder="Paste your JSON here to validate..."
          error={isValid === false}
        />
      </Panel>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            className={styles.errorBox}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className={styles.errorIcon}>✗</div>
            <div className={styles.errorContent}>
              <span className={styles.errorTitle}>Syntax Error</span>
              <span className={styles.errorMessage}>{error.message}</span>
              {error.line && (
                <span className={styles.errorLocation}>
                  Line {error.line}, Column {error.column}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <AnimatePresence>
        {stats && (
          <motion.div
            className={styles.statsGrid}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {[
              { icon: '{ }', label: 'Objects', value: stats.objects, color: '#6366f1' },
              { icon: '[ ]', label: 'Arrays', value: stats.arrays, color: '#8b5cf6' },
              { icon: '" "', label: 'Strings', value: stats.strings, color: '#22c55e' },
              { icon: '#', label: 'Numbers', value: stats.numbers, color: '#f59e0b' },
              { icon: '◯', label: 'Booleans', value: stats.booleans, color: '#ec4899' },
              { icon: '∅', label: 'Nulls', value: stats.nulls, color: '#ef4444' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className={styles.statCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className={styles.statCardIcon} style={{ color: stat.color }}>{stat.icon}</span>
                <span className={styles.statCardValue}>{stat.value}</span>
                <span className={styles.statCardLabel}>{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!liveMode && (
        <div className={styles.actionBar}>
          <Button variant="primary" size="large" onClick={validate} icon="✓">
            Validate JSON
          </Button>
        </div>
      )}
    </motion.div>
  )
}

export default JsonValidator