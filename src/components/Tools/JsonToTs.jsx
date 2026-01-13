import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Panel, Button, CodeEditor } from '../UI'
import styles from './Tools.module.css'

function JsonToTs() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [rootName, setRootName] = useState('RootType')

  const convert = () => {
    if (!input.trim()) {
      toast.error('Please enter JSON')
      return
    }

    try {
      const parsed = JSON.parse(input)
      const interfaces = generateInterfaces(parsed, rootName)
      setOutput(interfaces)
      toast.success('Generated TypeScript interfaces!')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const generateInterfaces = (obj, name) => {
    const interfaces = new Map()

    const getType = (value, key) => {
      if (value === null) return 'null'
      if (Array.isArray(value)) {
        if (value.length === 0) return 'any[]'
        const firstItem = value[0]
        if (typeof firstItem === 'object' && firstItem !== null) {
          const itemTypeName = capitalize(singularize(key)) + 'Item'
          generateInterfaceForObject(firstItem, itemTypeName, interfaces)
          return `${itemTypeName}[]`
        }
        return `${getType(firstItem, key)}[]`
      }
      if (typeof value === 'object') {
        const typeName = capitalize(key)
        generateInterfaceForObject(value, typeName, interfaces)
        return typeName
      }
      if (typeof value === 'string') return 'string'
      if (typeof value === 'number') return Number.isInteger(value) ? 'number' : 'number'
      if (typeof value === 'boolean') return 'boolean'
      return 'any'
    }

    const generateInterfaceForObject = (obj, name, interfaces) => {
      const properties = Object.entries(obj).map(([key, value]) => {
        const type = getType(value, key)
        const isOptional = value === null || value === undefined
        return `  ${key}${isOptional ? '?' : ''}: ${type};`
      })

      interfaces.set(name, `interface ${name} {\n${properties.join('\n')}\n}`)
    }

    generateInterfaceForObject(obj, name, interfaces)

    return Array.from(interfaces.values()).reverse().join('\n\n')
  }

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

  const singularize = (str) => {
    if (str.endsWith('ies')) return str.slice(0, -3) + 'y'
    if (str.endsWith('s') && !str.endsWith('ss')) return str.slice(0, -1)
    return str
  }

  const copyOutput = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    toast.success('Copied!')
  }

  const loadSample = () => {
    setInput(JSON.stringify({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      isActive: true,
      age: 30,
      balance: 1250.50,
      address: {
        street: "123 Main St",
        city: "New York",
        zipCode: "10001",
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      orders: [
        { id: 1, total: 99.99, items: ["item1", "item2"], status: "completed" },
        { id: 2, total: 149.99, items: ["item3"], status: "pending" }
      ],
      tags: ["premium", "verified"],
      metadata: null
    }, null, 2))
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
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Root Interface Name:</label>
          <input
            type="text"
            className={styles.textInput}
            value={rootName}
            onChange={(e) => setRootName(e.target.value || 'RootType')}
            placeholder="RootType"
          />
        </div>
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
          />
        </Panel>

        <Panel
          title="TypeScript Interfaces"
          actions={
            <Button size="small" variant="ghost" onClick={copyOutput} disabled={!output}>
              📋 Copy
            </Button>
          }
        >
          <CodeEditor
            value={output}
            onChange={() => {}}
            placeholder="TypeScript interfaces will appear here..."
            readOnly
          />
        </Panel>
      </div>

      <div className={styles.actionBar}>
        <Button variant="primary" size="large" onClick={convert} icon="TS">
          Generate TypeScript
        </Button>
      </div>
    </motion.div>
  )
}

export default JsonToTs