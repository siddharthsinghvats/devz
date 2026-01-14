import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Panel, Button, CodeEditor, JsonHighlighter, Badge } from '../UI'
import styles from './Tools.module.css'

function JsonEpochConverter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState('auto') // auto, seconds, milliseconds
  const [convertedCount, setConvertedCount] = useState(0)

  const isValidEpoch = (value, unit) => {
    if (typeof value !== 'number') return false
    
    // Epoch timestamps are typically between 1970 and 2100
    const min = unit === 'seconds' ? 0 : 0
    const max = unit === 'seconds' ? 4102444800 : 4102444800000 // Jan 1, 2100
    
    return value >= min && value <= max
  }

  const detectEpochUnit = (value) => {
    // If value is > 10 digits, it's likely milliseconds
    // If value is 10 digits, it's likely seconds
    const str = String(value)
    if (str.length >= 13) return 'milliseconds'
    if (str.length === 10) return 'seconds'
    
    // Try both and see which gives a reasonable date
    const asSeconds = new Date(value * 1000)
    const asMillis = new Date(value)
    
    const now = Date.now()
    const year2000 = new Date('2000-01-01').getTime()
    
    // Check which interpretation gives a date between 2000 and now + 10 years
    const secondsTime = asSeconds.getTime()
    const millisTime = asMillis.getTime()
    
    const secondsValid = secondsTime >= year2000 && secondsTime <= now + (10 * 365 * 24 * 60 * 60 * 1000)
    const millisValid = millisTime >= year2000 && millisTime <= now + (10 * 365 * 24 * 60 * 60 * 1000)
    
    if (secondsValid && !millisValid) return 'seconds'
    if (millisValid && !secondsValid) return 'milliseconds'
    
    // Default to milliseconds for ambiguous cases
    return 'milliseconds'
  }

  const convertEpochToHuman = (value, unit) => {
    let timestamp = value
    
    if (unit === 'auto') {
      unit = detectEpochUnit(value)
    }
    
    if (unit === 'seconds') {
      timestamp = value * 1000
    }
    
    const date = new Date(timestamp)
    
    // Return object with multiple formats
    return {
      utc: date.toUTCString(),
      date: date.toDateString(),
      time: date.toLocaleTimeString(),
      original: value,
      unit: unit
    }
  }

  const processJson = (obj, parentKey = '') => {
    let count = 0
    
    const process = (value, key) => {
      if (value === null || value === undefined) {
        return value
      }
      
      if (typeof value === 'number') {
        // Check if this might be an epoch timestamp
        const unit = mode === 'auto' ? detectEpochUnit(value) : mode
        
        if (isValidEpoch(value, unit)) {
          // Check if the key suggests it's a timestamp
          const keyLower = String(key).toLowerCase()
          const isTimestampKey = keyLower.includes('time') || 
                                 keyLower.includes('date') || 
                                 keyLower.includes('created') || 
                                 keyLower.includes('updated') ||
                                 keyLower.includes('modified') ||
                                 keyLower.includes('timestamp') ||
                                 keyLower.includes('epoch')
          
          // Convert if key suggests timestamp OR if in a reasonable epoch range
          if (isTimestampKey || (value > 946684800 && value < 4102444800000)) {
            count++
            const converted = convertEpochToHuman(value, unit)
            return {
              _epoch_original: value,
              _epoch_unit: converted.unit,
              utc: converted.utc,
              date_local: converted.date,
              time_local: converted.time
            }
          }
        }
      }
      
      if (Array.isArray(value)) {
        return value.map((item, index) => process(item, index))
      }
      
      if (typeof value === 'object') {
        const result = {}
        for (const [k, v] of Object.entries(value)) {
          result[k] = process(v, k)
        }
        return result
      }
      
      return value
    }
    
    const result = process(obj, parentKey)
    setConvertedCount(count)
    return result
  }

  const convert = () => {
    if (!input.trim()) {
      toast.error('Please enter JSON to convert')
      return
    }

    try {
      const parsed = JSON.parse(input)
      const converted = processJson(parsed)
      const formatted = JSON.stringify(converted, null, 2)
      setOutput(formatted)
      
      if (convertedCount > 0) {
        toast.success(`Converted ${convertedCount} epoch timestamp${convertedCount > 1 ? 's' : ''}!`)
      } else {
        toast('No epoch timestamps found', { icon: 'ℹ️' })
      }
    } catch (error) {
      toast.error(`Invalid JSON: ${error.message}`)
    }
  }

  const copyOutput = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    toast.success('Copied to clipboard!')
  }

  const loadSample = () => {
    setInput(JSON.stringify({
      user: {
        id: 1,
        name: "John Doe",
        created_at: 1704067200,
        last_login: 1736899200000,
        birth_timestamp: 631152000
      },
      posts: [
        {
          id: 1,
          title: "First Post",
          published_time: 1735689600,
          updated: 1736812800000
        },
        {
          id: 2,
          title: "Second Post",
          timestamp: 1736294400,
          modified_date: 1736899200000
        }
      ],
      metadata: {
        server_time: 1736899200,
        cache_expiry: 1737504000000,
        session_start: 1736812800
      }
    }, null, 2))
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setConvertedCount(0)
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
          <span className={styles.controlLabel}>Detection Mode:</span>
          <div className={styles.toggleGroup}>
            <button
              className={`${styles.toggleBtn} ${mode === 'auto' ? styles.active : ''}`}
              onClick={() => setMode('auto')}
            >
              Auto Detect
            </button>
            <button
              className={`${styles.toggleBtn} ${mode === 'seconds' ? styles.active : ''}`}
              onClick={() => setMode('seconds')}
            >
              Seconds
            </button>
            <button
              className={`${styles.toggleBtn} ${mode === 'milliseconds' ? styles.active : ''}`}
              onClick={() => setMode('milliseconds')}
            >
              Milliseconds
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

      {/* Input/Output Panels */}
      <div className={styles.gridAuto}>
        <Panel title="Input JSON">
          <CodeEditor
            value={input}
            onChange={setInput}
            placeholder='Paste JSON with epoch timestamps...

{
  "created_at": 1704067200,
  "timestamp": 1736899200000
}'
          />
        </Panel>

        <Panel
          title="Converted Output"
          actions={
            <>
              {convertedCount > 0 && (
                <Badge variant="success">
                  {convertedCount} converted
                </Badge>
              )}
              <Button size="small" variant="ghost" onClick={copyOutput} disabled={!output}>
                📋 Copy
              </Button>
            </>
          }
        >
          {output ? (
            <JsonHighlighter json={output} />
          ) : (
            <div className={styles.placeholder}>
              Converted JSON will appear here with epoch timestamps expanded into human-readable dates
            </div>
          )}
        </Panel>
      </div>

      {/* Info Box */}
      {mode !== 'auto' && (
        <div className={styles.infoBar}>
          ℹ️ Converting all numbers as {mode === 'seconds' ? 'seconds' : 'milliseconds'} timestamps
        </div>
      )}

      {/* Action Button */}
      <div className={styles.actionBar}>
        <Button variant="primary" size="large" onClick={convert} icon="🕐">
          Convert Epoch Timestamps
        </Button>
      </div>
    </motion.div>
  )
}

export default JsonEpochConverter