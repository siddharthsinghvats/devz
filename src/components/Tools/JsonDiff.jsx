import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Panel, Button, Badge, CodeEditor } from '../UI'
import styles from './Tools.module.css'
import diffStyles from './JsonDiff.module.css'

function JsonDiff() {
  const [leftInput, setLeftInput] = useState('')
  const [rightInput, setRightInput] = useState('')
  const [diffResult, setDiffResult] = useState(null)

  const compare = () => {
    if (!leftInput.trim() || !rightInput.trim()) {
      toast.error('Please enter JSON in both panels')
      return
    }

    try {
      const leftObj = JSON.parse(leftInput)
      const rightObj = JSON.parse(rightInput)

      const leftFormatted = JSON.stringify(leftObj, null, 2)
      const rightFormatted = JSON.stringify(rightObj, null, 2)

      const differences = findDifferences(leftObj, rightObj)
      const { leftLines, rightLines } = generateDiffLines(leftFormatted, rightFormatted, differences)

      setDiffResult({
        differences,
        leftLines,
        rightLines,
        leftFormatted,
        rightFormatted,
      })

      if (differences.length === 0) {
        toast.success('Both JSON objects are identical!')
      } else {
        toast(`Found ${differences.length} difference(s)`, { icon: '🔍' })
      }
    } catch (error) {
      toast.error(`Invalid JSON: ${error.message}`)
    }
  }

  const findDifferences = (obj1, obj2, path = '') => {
    const result = []
    const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})])

    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key
      const val1 = obj1?.[key]
      const val2 = obj2?.[key]

      if (!(key in (obj1 || {}))) {
        result.push({ path: currentPath, type: 'added', left: undefined, right: val2 })
      } else if (!(key in (obj2 || {}))) {
        result.push({ path: currentPath, type: 'removed', left: val1, right: undefined })
      } else if (
        typeof val1 === 'object' && typeof val2 === 'object' &&
        val1 !== null && val2 !== null &&
        !Array.isArray(val1) && !Array.isArray(val2)
      ) {
        result.push(...findDifferences(val1, val2, currentPath))
      } else if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        result.push({ path: currentPath, type: 'changed', left: val1, right: val2 })
      }
    }
    return result
  }

  const generateDiffLines = (leftJson, rightJson, differences) => {
    const leftLines = leftJson.split('\n').map((content, i) => ({
      number: i + 1,
      content,
      type: 'unchanged',
    }))

    const rightLines = rightJson.split('\n').map((content, i) => ({
      number: i + 1,
      content,
      type: 'unchanged',
    }))

    differences.forEach(diff => {
      const pathParts = diff.path.split('.')
      const searchKey = `"${pathParts[pathParts.length - 1]}"`

      if (diff.type === 'removed' || diff.type === 'changed') {
        leftLines.forEach(line => {
          if (line.content.includes(searchKey)) {
            line.type = diff.type === 'removed' ? 'removed' : 'changed'
          }
        })
      }

      if (diff.type === 'added' || diff.type === 'changed') {
        rightLines.forEach(line => {
          if (line.content.includes(searchKey)) {
            line.type = diff.type === 'added' ? 'added' : 'changed'
          }
        })
      }
    })

    return { leftLines, rightLines }
  }

  const loadSample = () => {
    setLeftInput(JSON.stringify({
      name: "John Doe",
      age: 30,
      city: "New York",
      email: "john@example.com",
      skills: ["JavaScript", "React"],
      active: true
    }, null, 2))

    setRightInput(JSON.stringify({
      name: "John Doe",
      age: 31,
      country: "USA",
      email: "john.doe@example.com",
      skills: ["JavaScript", "Vue", "Node.js"],
      active: true
    }, null, 2))

    setDiffResult(null)
  }

  const clearAll = () => {
    setLeftInput('')
    setRightInput('')
    setDiffResult(null)
  }

  return (
    <motion.div
      className={styles.toolPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Controls */}
      <div className={styles.controls}>
        <div />
        <div className={styles.controlActions}>
          <Button size="small" variant="ghost" onClick={loadSample}>
            📄 Sample
          </Button>
          <Button size="small" variant="ghost" onClick={clearAll}>
            🗑️ Clear
          </Button>
        </div>
      </div>

      {/* Input Panels */}
      {!diffResult && (
        <div className={styles.gridAuto}>
          <Panel title="Left JSON (Original)">
            <CodeEditor
              value={leftInput}
              onChange={setLeftInput}
              placeholder="Paste first JSON here..."
            />
          </Panel>

          <Panel title="Right JSON (Modified)">
            <CodeEditor
              value={rightInput}
              onChange={setRightInput}
              placeholder="Paste second JSON here..."
            />
          </Panel>
        </div>
      )}

      {/* Diff Result View */}
      <AnimatePresence>
        {diffResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Summary */}
            <div className={diffStyles.summary}>
              <div className={diffStyles.summaryStats}>
                <Badge variant={diffResult.differences.length === 0 ? 'success' : 'info'}>
                  {diffResult.differences.length === 0
                    ? '✓ Identical'
                    : `${diffResult.differences.length} difference${diffResult.differences.length > 1 ? 's' : ''}`}
                </Badge>
                <span className={diffStyles.statItem}>
                  <span className={diffStyles.statDot} style={{ background: '#f87171' }} />
                  {diffResult.differences.filter(d => d.type === 'removed').length} removed
                </span>
                <span className={diffStyles.statItem}>
                  <span className={diffStyles.statDot} style={{ background: '#4ade80' }} />
                  {diffResult.differences.filter(d => d.type === 'added').length} added
                </span>
                <span className={diffStyles.statItem}>
                  <span className={diffStyles.statDot} style={{ background: '#fbbf24' }} />
                  {diffResult.differences.filter(d => d.type === 'changed').length} changed
                </span>
              </div>
              <Button size="small" variant="ghost" onClick={() => setDiffResult(null)}>
                ← Edit Input
              </Button>
            </div>

            {/* Side-by-side Diff View */}
            <div className={diffStyles.diffContainer}>
              <div className={diffStyles.diffPanel}>
                <div className={diffStyles.diffHeader}>
                  <span>Original</span>
                </div>
                <div className={diffStyles.diffContent}>
                  {diffResult.leftLines.map((line) => (
                    <div
                      key={line.number}
                      className={`${diffStyles.diffLine} ${diffStyles[line.type]}`}
                    >
                      <span className={diffStyles.lineNumber}>{line.number}</span>
                      <span className={diffStyles.lineSymbol}>
                        {line.type === 'removed' ? '−' : line.type === 'changed' ? '~' : ' '}
                      </span>
                      <pre className={diffStyles.lineContent}>
                        <HighlightedLine content={line.content} />
                      </pre>
                    </div>
                  ))}
                </div>
              </div>

              <div className={diffStyles.diffPanel}>
                <div className={diffStyles.diffHeader}>
                  <span>Modified</span>
                </div>
                <div className={diffStyles.diffContent}>
                  {diffResult.rightLines.map((line) => (
                    <div
                      key={line.number}
                      className={`${diffStyles.diffLine} ${diffStyles[line.type]}`}
                    >
                      <span className={diffStyles.lineNumber}>{line.number}</span>
                      <span className={diffStyles.lineSymbol}>
                        {line.type === 'added' ? '+' : line.type === 'changed' ? '~' : ' '}
                      </span>
                      <pre className={diffStyles.lineContent}>
                        <HighlightedLine content={line.content} />
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Changes List */}
            {diffResult.differences.length > 0 && (
              <div className={diffStyles.changesList}>
                <h4 className={diffStyles.changesTitle}>Detailed Changes</h4>
                <div className={diffStyles.changesGrid}>
                  {diffResult.differences.map((diff, i) => (
                    <motion.div
                      key={i}
                      className={`${diffStyles.changeItem} ${diffStyles[diff.type]}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <div className={diffStyles.changePath}>
                        <code>{diff.path}</code>
                        <Badge
                          variant={
                            diff.type === 'added' ? 'success' :
                            diff.type === 'removed' ? 'error' : 'warning'
                          }
                          size="small"
                        >
                          {diff.type}
                        </Badge>
                      </div>
                      <div className={diffStyles.changeValues}>
                        {diff.type === 'changed' && (
                          <>
                            <span className={diffStyles.oldValue}>
                              {JSON.stringify(diff.left)}
                            </span>
                            <span className={diffStyles.arrow}>→</span>
                            <span className={diffStyles.newValue}>
                              {JSON.stringify(diff.right)}
                            </span>
                          </>
                        )}
                        {diff.type === 'removed' && (
                          <span className={diffStyles.oldValue}>
                            {JSON.stringify(diff.left)}
                          </span>
                        )}
                        {diff.type === 'added' && (
                          <span className={diffStyles.newValue}>
                            {JSON.stringify(diff.right)}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Button */}
      {!diffResult && (
        <div className={styles.actionBar}>
          <Button variant="primary" size="large" onClick={compare} icon="◫">
            Compare JSON
          </Button>
        </div>
      )}
    </motion.div>
  )
}

// Highlighted Line Component
function HighlightedLine({ content }) {
  const highlighted = useMemo(() => {
    let result = ''
    let i = 0
    
    const escapeHtml = (str) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    }

    while (i < content.length) {
      const char = content[i]
      const rest = content.slice(i)

      if (char === ' ' || char === '\t') {
        result += char
        i++
        continue
      }

      if (char === '{' || char === '}' || char === '[' || char === ']') {
        result += `<span class="json-bracket">${char}</span>`
        i++
        continue
      }

      if (char === ':') {
        result += `<span class="json-colon">:</span>`
        i++
        continue
      }

      if (char === ',') {
        result += `<span class="json-comma">,</span>`
        i++
        continue
      }

      if (char === '"') {
        let str = '"'
        i++
        
        while (i < content.length) {
          const c = content[i]
          
          if (c === '\\' && i + 1 < content.length) {
            str += c + content[i + 1]
            i += 2
          } else if (c === '"') {
            str += '"'
            i++
            break
          } else {
            str += c
            i++
          }
        }

        let j = i
        while (j < content.length && (content[j] === ' ' || content[j] === '\t')) {
          j++
        }
        
        const isKey = content[j] === ':'
        const escapedStr = escapeHtml(str)
        
        if (isKey) {
          result += `<span class="json-key">${escapedStr}</span>`
        } else {
          result += `<span class="json-string">${escapedStr}</span>`
        }
        continue
      }

      const numberMatch = rest.match(/^-?\d+\.?\d*([eE][+-]?\d+)?/)
      if (numberMatch) {
        result += `<span class="json-number">${numberMatch[0]}</span>`
        i += numberMatch[0].length
        continue
      }

      if (rest.startsWith('true')) {
        result += `<span class="json-boolean">true</span>`
        i += 4
        continue
      }

      if (rest.startsWith('false')) {
        result += `<span class="json-boolean">false</span>`
        i += 5
        continue
      }

      if (rest.startsWith('null')) {
        result += `<span class="json-null">null</span>`
        i += 4
        continue
      }

      result += escapeHtml(char)
      i++
    }

    return result
  }, [content])

  return <span dangerouslySetInnerHTML={{ __html: highlighted }} />
}

export default JsonDiff