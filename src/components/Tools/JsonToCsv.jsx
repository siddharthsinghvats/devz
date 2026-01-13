import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Panel, Button, CodeEditor } from '../UI'
import styles from './Tools.module.css'

function JsonToCsv() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [rowCount, setRowCount] = useState(0)

  const convert = () => {
    if (!input.trim()) {
      toast.error('Please enter a JSON array')
      return
    }

    try {
      const parsed = JSON.parse(input)

      if (!Array.isArray(parsed)) {
        toast.error('Input must be a JSON array of objects')
        return
      }

      if (parsed.length === 0) {
        toast.error('Array is empty')
        return
      }

      const headers = [...new Set(parsed.flatMap(obj => Object.keys(obj)))]

      const escapeCell = (value) => {
        if (value === null || value === undefined) return ''
        const str = typeof value === 'object' ? JSON.stringify(value) : String(value)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }

      const rows = [
        headers.join(','),
        ...parsed.map(obj => headers.map(h => escapeCell(obj[h])).join(','))
      ]

      setOutput(rows.join('\n'))
      setRowCount(parsed.length)
      toast.success(`Converted ${parsed.length} rows to CSV!`)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const download = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded data.csv!')
  }

  const copyOutput = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    toast.success('Copied!')
  }

  const loadSample = () => {
    setInput(JSON.stringify([
      { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Developer", salary: 75000, active: true },
      { id: 2, name: "Bob Smith", email: "bob@example.com", role: "Designer", salary: 68000, active: true },
      { id: 3, name: "Charlie Brown", email: "charlie@example.com", role: "Manager", salary: 85000, active: false },
      { id: 4, name: "Diana Prince", email: "diana@example.com", role: "Developer", salary: 72000, active: true },
      { id: 5, name: "Edward Norton", email: "edward@example.com", role: "QA Engineer", salary: 65000, active: true },
    ], null, 2))
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setRowCount(0)
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
          <Button size="small" variant="ghost" onClick={loadSample}>📄 Sample</Button>
          <Button size="small" variant="ghost" onClick={clearAll}>🗑️ Clear</Button>
        </div>
      </div>

      <div className={styles.gridAuto}>
        <Panel title="Input JSON Array">
          <CodeEditor
            value={input}
            onChange={setInput}
            placeholder='Paste a JSON array of objects...

[
  { "name": "John", "age": 30 },
  { "name": "Jane", "age": 25 }
]'
          />
        </Panel>

        <Panel
          title="Output CSV"
          actions={
            <>
              <Button size="small" variant="ghost" onClick={copyOutput} disabled={!output}>
                📋 Copy
              </Button>
              <Button size="small" variant="ghost" onClick={download} disabled={!output}>
                ⬇️ Download
              </Button>
            </>
          }
        >
          <CodeEditor
            value={output}
            onChange={() => {}}
            placeholder="CSV output will appear here..."
            readOnly
          />
        </Panel>
      </div>

      {rowCount > 0 && (
        <motion.div
          className={styles.infoBar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          ✓ Successfully converted {rowCount} rows to CSV
        </motion.div>
      )}

      <div className={styles.actionBar}>
        <Button variant="primary" size="large" onClick={convert} icon="▤">
          Convert to CSV
        </Button>
      </div>
    </motion.div>
  )
}

export default JsonToCsv