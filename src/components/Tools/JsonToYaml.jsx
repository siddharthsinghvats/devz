import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import yaml from 'js-yaml'
import { Panel, Button, CodeEditor } from '../UI'
import styles from './Tools.module.css'

function JsonToYaml() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState('json-to-yaml')

  const convert = () => {
    if (!input.trim()) {
      toast.error('Please enter content to convert')
      return
    }

    try {
      if (mode === 'json-to-yaml') {
        const parsed = JSON.parse(input)
        const result = yaml.dump(parsed, { indent: 2, lineWidth: -1, noRefs: true })
        setOutput(result)
        toast.success('Converted to YAML!')
      } else {
        const parsed = yaml.load(input)
        const result = JSON.stringify(parsed, null, 2)
        setOutput(result)
        toast.success('Converted to JSON!')
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const swap = () => {
    setMode(mode === 'json-to-yaml' ? 'yaml-to-json' : 'json-to-yaml')
    setInput(output)
    setOutput('')
  }

  const copyOutput = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    toast.success('Copied!')
  }

  const loadSample = () => {
    if (mode === 'json-to-yaml') {
      setInput(JSON.stringify({
        server: { host: "localhost", port: 8080, ssl: true },
        database: { driver: "postgresql", name: "myapp", pool: { min: 5, max: 20 } },
        features: ["auth", "api", "websocket"],
        logging: { level: "info", format: "json" }
      }, null, 2))
    } else {
      setInput(`server:
  host: localhost
  port: 8080
  ssl: true
database:
  driver: postgresql
  name: myapp
  pool:
    min: 5
    max: 20
features:
  - auth
  - api
  - websocket
logging:
  level: info
  format: json`)
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
            className={`${styles.toggleBtn} ${mode === 'json-to-yaml' ? styles.active : ''}`}
            onClick={() => setMode('json-to-yaml')}
          >
            JSON → YAML
          </button>
          <button
            className={`${styles.toggleBtn} ${mode === 'yaml-to-json' ? styles.active : ''}`}
            onClick={() => setMode('yaml-to-json')}
          >
            YAML → JSON
          </button>
        </div>
        <div className={styles.controlActions}>
          <Button size="small" variant="ghost" onClick={loadSample}>📄 Sample</Button>
          <Button size="small" variant="ghost" onClick={clearAll}>🗑️ Clear</Button>
        </div>
      </div>

      <div className={styles.gridAuto}>
        <Panel title={mode === 'json-to-yaml' ? 'Input JSON' : 'Input YAML'}>
          <CodeEditor
            value={input}
            onChange={setInput}
            placeholder={mode === 'json-to-yaml' ? 'Paste JSON here...' : 'Paste YAML here...'}
          />
        </Panel>

        <Panel
          title={mode === 'json-to-yaml' ? 'Output YAML' : 'Output JSON'}
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
        <Button variant="primary" size="large" onClick={convert} icon="⇄">
          Convert
        </Button>
        <Button size="large" onClick={swap} disabled={!output}>
          ↔ Swap & Edit
        </Button>
      </div>
    </motion.div>
  )
}

export default JsonToYaml