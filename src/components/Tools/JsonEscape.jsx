import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Panel, Button, CodeEditor } from '../UI'
import styles from './Tools.module.css'

function JsonEscape() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState('escape')

  const process = () => {
    if (!input.trim()) {
      toast.error('Please enter text to process')
      return
    }

    try {
      if (mode === 'escape') {
        const escaped = JSON.stringify(input)
        setOutput(escaped)
        toast.success('Text escaped successfully!')
      } else {
        const unescaped = JSON.parse(input)
        if (typeof unescaped !== 'string') {
          toast.error('Input must be a JSON string (wrapped in quotes)')
          return
        }
        setOutput(unescaped)
        toast.success('Text unescaped successfully!')
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const copyOutput = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    toast.success('Copied!')
  }

  const loadSample = () => {
    if (mode === 'escape') {
      setInput(`Hello "World"!
This is a multi-line string.
Special chars: \t tab, \\ backslash, and "quotes"
Unicode: café ☕ 日本語`)
    } else {
      setInput(`"Hello \\"World\\"!\\nThis is a multi-line string.\\nSpecial chars: \\t tab, \\\\ backslash, and \\"quotes\\"\\nUnicode: café ☕ 日本語"`)
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
  }

  return (
    <motion.div
      className={styles.toolPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className={styles.controls}>
        <div className={styles.toggleGroup}>
          <button
            className={`${styles.toggleBtn} ${mode === 'escape' ? styles.active : ''}`}
            onClick={() => { setMode('escape'); setInput(''); setOutput(''); }}
          >
            Escape
          </button>
          <button
            className={`${styles.toggleBtn} ${mode === 'unescape' ? styles.active : ''}`}
            onClick={() => { setMode('unescape'); setInput(''); setOutput(''); }}
          >
            Unescape
          </button>
        </div>
        <div className={styles.controlActions}>
          <Button size="small" variant="ghost" onClick={loadSample}>📄 Sample</Button>
          <Button size="small" variant="ghost" onClick={clearAll}>🗑️ Clear</Button>
        </div>
      </div>

      <div className={styles.gridAuto}>
        <Panel title={mode === 'escape' ? 'Input Text' : 'Escaped JSON String'}>
          <CodeEditor
            value={input}
            onChange={setInput}
            placeholder={mode === 'escape'
              ? 'Enter plain text to escape...\n\nSpecial characters like quotes, newlines, and tabs will be escaped.'
              : 'Enter escaped JSON string...\n\n"Example: \\"Hello\\nWorld\\"'
            }
          />
        </Panel>

        <Panel
          title={mode === 'escape' ? 'Escaped Output' : 'Unescaped Text'}
          actions={
            <Button size="small" variant="ghost" onClick={copyOutput} disabled={!output}>
              📋 Copy
            </Button>
          }
        >
          <CodeEditor
            value={output}
            onChange={() => {}}
            placeholder="Output will appear here..."
            readOnly
          />
        </Panel>
      </div>

      <div className={styles.actionBar}>
        <Button variant="primary" size="large" onClick={process} icon="\\">
          {mode === 'escape' ? 'Escape Text' : 'Unescape Text'}
        </Button>
      </div>
    </motion.div>
  )
}

export default JsonEscape