import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Panel, Button, Badge, CodeEditor, JsonHighlighter } from '../UI'
import styles from './Tools.module.css'

const STORAGE_KEY = 'devtools_class_to_json'

const SAMPLE_LOG = `NwRequest{id='1', name='X', extraFields={id=2, status=COMPLETED}}
NwRequest{id='2', name='UserProfile', extraFields={userId=1001, status=PENDING, metadata={key=value, nested={a=1, b=2}}}}
NwResponse{code=200, message='Success', data={items=[1, 2, 3], count=3}}`

// Parse a value - could be a string, number, boolean, null, nested object, or array
function parseValue(value) {
  if (!value) return null
  
  value = value.trim()
  
  // Check for array like [1, 2, 3] or [item1, item2]
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim()
    if (!inner) return []
    
    // Parse array elements
    const elements = splitByComma(inner)
    return elements.map(el => parseValue(el.trim()))
  }
  
  // Check for nested object like {key=value, key2=value2}
  if (value.startsWith('{') && value.endsWith('}')) {
    return parseNestedObject(value.slice(1, -1))
  }
  
  // Check for quoted string
  if ((value.startsWith("'") && value.endsWith("'")) || 
      (value.startsWith('"') && value.endsWith('"'))) {
    return value.slice(1, -1)
  }
  
  // Check for numbers
  if (!isNaN(value) && value !== '') {
    return Number(value)
  }
  
  // Check for booleans
  if (value.toLowerCase() === 'true') return true
  if (value.toLowerCase() === 'false') return false
  
  // Check for null
  if (value.toLowerCase() === 'null') return null
  
  // Return as string
  return value
}

// Split by comma, respecting nested braces and brackets
function splitByComma(str) {
  const parts = []
  let current = ''
  let braceCount = 0
  let bracketCount = 0
  let inQuote = false
  let quoteChar = null
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    
    if (!inQuote && (char === "'" || char === '"')) {
      inQuote = true
      quoteChar = char
    } else if (inQuote && char === quoteChar) {
      inQuote = false
      quoteChar = null
    }
    
    if (!inQuote) {
      if (char === '{') braceCount++
      else if (char === '}') braceCount--
      else if (char === '[') bracketCount++
      else if (char === ']') bracketCount--
      else if (char === ',' && braceCount === 0 && bracketCount === 0) {
        parts.push(current.trim())
        current = ''
        continue
      }
    }
    
    current += char
  }
  
  if (current.trim()) {
    parts.push(current.trim())
  }
  
  return parts
}

// Parse nested object like key=value, key2=value2
function parseNestedObject(content) {
  const result = {}
  const pairs = splitByComma(content)
  
  for (const pair of pairs) {
    const eqIndex = pair.indexOf('=')
    if (eqIndex === -1) continue
    
    const key = pair.slice(0, eqIndex).trim()
    const value = pair.slice(eqIndex + 1).trim()
    result[key] = parseValue(value)
  }
  
  return result
}

// Parse a single log line like NwRequest{id='1', name='X', extraFields={...}}
function parseClassLine(line) {
  line = line.trim()
  if (!line) return null
  
  // Match pattern: ClassName{...}
  const match = line.match(/^(\w+)\{(.+)\}$/)
  if (!match) {
    throw new Error(`Invalid format: expected "ClassName{...}" pattern`)
  }
  
  const [, className, content] = match
  const fields = parseNestedObject(content)
  
  return {
    _type: className,
    ...fields
  }
}

// Parse multiple lines
function parseClasses(input) {
  const lines = input.split('\n').filter(line => line.trim())
  const results = []
  const errors = []
  
  lines.forEach((line, index) => {
    try {
      const parsed = parseClassLine(line)
      if (parsed) {
        results.push(parsed)
      }
    } catch (err) {
      errors.push({ line: index + 1, error: err.message, content: line })
    }
  })
  
  return { results, errors }
}

function ClassToJson() {
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
  
  const [parseInfo, setParseInfo] = useState(null)
  const [indent, setIndent] = useState(2)

  // Save to localStorage when input/output changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ input, output }))
    } catch (e) {}
  }, [input, output])

  const parseInput = () => {
    if (!input.trim()) {
      toast.error('Please enter class entries to parse')
      return
    }

    try {
      const { results, errors } = parseClasses(input)
      
      if (results.length === 0 && errors.length > 0) {
        setOutput('')
        setParseInfo({ success: false, errors })
        toast.error('Failed to parse any entries')
        return
      }
      
      // Format output - single object or array
      const jsonOutput = results.length === 1 
        ? JSON.stringify(results[0], null, indent)
        : JSON.stringify(results, null, indent)
      
      setOutput(jsonOutput)
      setParseInfo({ 
        success: true, 
        count: results.length, 
        errors,
        hasErrors: errors.length > 0
      })
      
      if (errors.length > 0) {
        toast.success(`Parsed ${results.length} entries (${errors.length} failed)`)
      } else {
        toast.success(`Successfully parsed ${results.length} ${results.length === 1 ? 'entry' : 'entries'}!`)
      }
    } catch (error) {
      setParseInfo({ success: false, errors: [{ error: error.message }] })
      setOutput('')
      toast.error(`Parse error: ${error.message}`)
    }
  }

  const copyOutput = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    toast.success('Copied to clipboard!')
  }

  const loadSample = () => {
    setInput(SAMPLE_LOG)
    setParseInfo(null)
    setOutput('')
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setParseInfo(null)
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

      {/* Supported Formats */}
      <div className={styles.infoBar}>
        📝 Supports formats like: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>ClassName{'{'}key='value', nested={'{'}a=1{'}'}{'}'}</code>
      </div>

      {/* Panels */}
      <div className={styles.gridAuto}>
        <Panel
          title="Class Input"
          expandable={true}
          defaultExpanded={true}
          actions={
            parseInfo && (
              <Badge variant={parseInfo.success ? 'success' : 'error'}>
                {parseInfo.success ? `✓ ${parseInfo.count} parsed` : '✗ Parse failed'}
              </Badge>
            )
          }
        >
          <CodeEditor
            value={input}
            onChange={setInput}
            placeholder={`Paste your class entries here...

NwRequest{id='1', name='X', extraFields={id=2, status=COMPLETED}}
NwResponse{code=200, message='Success', data={items=[1, 2, 3]}}`}
          />
        </Panel>

        <Panel
          title="JSON Output"
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
              Converted JSON will appear here with syntax highlighting...
            </div>
          )}
        </Panel>
      </div>

      {/* Parse Errors */}
      {parseInfo?.errors?.length > 0 && (
        <div className={styles.errorBox}>
          <div className={styles.errorIcon}>!</div>
          <div className={styles.errorContent}>
            <div className={styles.errorTitle}>
              {parseInfo.errors.length} line{parseInfo.errors.length > 1 ? 's' : ''} failed to parse
            </div>
            {parseInfo.errors.slice(0, 3).map((err, i) => (
              <div key={i} className={styles.errorMessage}>
                Line {err.line}: {err.error}
              </div>
            ))}
            {parseInfo.errors.length > 3 && (
              <div className={styles.errorLocation}>
                ...and {parseInfo.errors.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className={styles.actionBar}>
        <Button variant="primary" size="large" onClick={parseInput} icon="🔄">
          Convert to JSON
        </Button>
      </div>
    </motion.div>
  )
}

export default ClassToJson
