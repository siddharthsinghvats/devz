import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Panel, Button, Badge, CodeEditor, JsonHighlighter } from '../UI'
import styles from './Tools.module.css'

const STORAGE_KEY = 'devtools_json_formatter'

const SAMPLE_JSON = {
  name: "John Doe",
  age: 30,
  email: "john@example.com",
  isActive: true,
  balance: 1250.50,
  address: {
    street: "123 Main St",
    city: "New York",
    country: "USA",
    zip: "10001"
  },
  skills: ["JavaScript", "React", "Node.js", "TypeScript"],
  projects: [
    { id: 1, name: "Website", status: "completed" },
    { id: 2, name: "Mobile App", status: "in-progress" }
  ],
  metadata: null
}

function JsonFormatter() {
  const [input, setInput] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const { input: savedInput } = JSON.parse(saved)
        return savedInput || ''
      }
    } catch (e) {}
    return ''
  })
  
  const [output, setOutput] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const { output: savedOutput } = JSON.parse(saved)
        return savedOutput || ''
      }
    } catch (e) {}
    return ''
  })
  
  const [indent, setIndent] = useState(2)
  const [isValid, setIsValid] = useState(null)

  // Save to localStorage when input/output changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ input, output }))
    } catch (e) {}
  }, [input, output])

  const formatJson = () => {
    if (!input.trim()) {
      toast.error('Please enter JSON to format')
      return
    }

    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, indent)
      setOutput(formatted)
      setIsValid(true)
      toast.success('JSON formatted successfully!')
    } catch (error) {
      setIsValid(false)
      setOutput('')
      toast.error(`Invalid JSON: ${error.message}`)
    }
  }

  const copyOutput = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    toast.success('Copied to clipboard!')
  }

  const loadSample = () => {
    setInput(JSON.stringify(SAMPLE_JSON))
    setIsValid(null)
    setOutput('')
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setIsValid(null)
  }

  return (
    <motion.div
      className={styles.toolPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Indent:</span>
          <div className={styles.toggleGroup}>
            {[2, 4].map((n) => (
              <button
                key={n}
                className={`${styles.toggleBtn} ${indent === n ? styles.active : ''}`}
                onClick={() => setIndent(n)}
              >
                {n} spaces
              </button>
            ))}
            <button
              className={`${styles.toggleBtn} ${indent === '\t' ? styles.active : ''}`}
              onClick={() => setIndent('\t')}
            >
              Tab
            </button>
          </div>
        </div>

        <div className={styles.controlActions}>
          <Button size="small" variant="ghost" onClick={loadSample}>
            📄 Sample
          </Button>
          <Button size="small" variant="ghost" onClick={clearAll}>
            🗑️ Clear
          </Button>
        </div>
      </div>

      {/* Panels */}
      <div className={styles.gridAuto}>
        <Panel
          title="Input"
          expandable={true}
          defaultExpanded={true}
          actions={
            isValid !== null && (
              <Badge variant={isValid ? 'success' : 'error'}>
                {isValid ? '✓ Valid' : '✗ Invalid'}
              </Badge>
            )
          }
        >
          <CodeEditor
            value={input}
            onChange={setInput}
            placeholder='Paste your JSON here...

{
  "example": "value",
  "number": 123,
  "active": true
}'
            error={isValid === false}
          />
        </Panel>

        <Panel
          title="Formatted Output"
          expandable={true}
          defaultExpanded={true}
          actions={
            <Button size="small" variant="ghost" onClick={copyOutput} disabled={!output}>
              📋 Copy
            </Button>
          }
        >
          {output ? (
            <JsonHighlighter json={output} />
          ) : (
            <div className={styles.placeholder}>
              Formatted JSON with syntax highlighting will appear here...
            </div>
          )}
        </Panel>
      </div>

      {/* Action Button */}
      <div className={styles.actionBar}>
        <Button variant="primary" size="large" onClick={formatJson} icon="✨">
          Format JSON
        </Button>
      </div>
    </motion.div>
  )
}

export default JsonFormatter