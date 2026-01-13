import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Panel, Button, CodeEditor } from '../UI'
import styles from './Tools.module.css'

function JsonMinifier() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [stats, setStats] = useState(null)

  const minifyJson = () => {
    if (!input.trim()) {
      toast.error('Please enter JSON to minify')
      return
    }

    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)

      const originalSize = new Blob([input]).size
      const minifiedSize = new Blob([minified]).size
      const savings = originalSize - minifiedSize
      const percentage = ((savings / originalSize) * 100).toFixed(1)

      setOutput(minified)
      setStats({ originalSize, minifiedSize, savings, percentage })
      toast.success(`Minified! Saved ${savings} bytes (${percentage}%)`)
    } catch (error) {
      toast.error(`Invalid JSON: ${error.message}`)
    }
  }

  const copyOutput = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    toast.success('Copied to clipboard!')
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setStats(null)
  }

  return (
    <motion.div
      className={styles.toolPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className={styles.controls}>
        <div />
        <div className={styles.controlActions}>
          <Button size="small" variant="ghost" onClick={clearAll}>
            🗑️ Clear
          </Button>
        </div>
      </div>

      <div className={styles.gridAuto}>
        <Panel title="Input JSON">
          <CodeEditor
            value={input}
            onChange={setInput}
            placeholder="Paste your formatted JSON here..."
          />
        </Panel>

        <Panel
          title="Minified Output"
          actions={
            <Button size="small" variant="ghost" onClick={copyOutput} disabled={!output}>
              📋 Copy
            </Button>
          }
        >
          <CodeEditor
            value={output}
            onChange={() => {}}
            placeholder="Minified JSON will appear here..."
            readOnly
            minHeight={100}
          />
        </Panel>
      </div>

      {/* Stats */}
      {stats && (
        <motion.div
          className={styles.statsBar}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.stat}>
            <span className={styles.statLabel}>Original</span>
            <span className={styles.statValue}>{stats.originalSize.toLocaleString()} bytes</span>
          </div>
          <div className={styles.statDivider}>→</div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Minified</span>
            <span className={styles.statValue}>{stats.minifiedSize.toLocaleString()} bytes</span>
          </div>
          <div className={styles.statDivider}>=</div>
          <div className={`${styles.stat} ${styles.statHighlight}`}>
            <span className={styles.statLabel}>Saved</span>
            <span className={styles.statValue}>{stats.savings.toLocaleString()} bytes ({stats.percentage}%)</span>
          </div>
        </motion.div>
      )}

      <div className={styles.actionBar}>
        <Button variant="primary" size="large" onClick={minifyJson} icon="⚡">
          Minify JSON
        </Button>
      </div>
    </motion.div>
  )
}

export default JsonMinifier