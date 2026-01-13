import { useMemo } from 'react'
import styles from './JsonHighlighter.module.css'

function JsonHighlighter({ json, showLineNumbers = true }) {
  const highlighted = useMemo(() => {
    if (!json) return []

    const lines = json.split('\n')
    return lines.map((line, index) => ({
      number: index + 1,
      content: highlightLine(line),
    }))
  }, [json])

  return (
    <div className={styles.container}>
      <pre className={styles.pre}>
        {highlighted.map((line) => (
          <div key={line.number} className={styles.line}>
            {showLineNumbers && (
              <span className={styles.lineNumber}>{line.number}</span>
            )}
            <span
              className={styles.lineContent}
              dangerouslySetInnerHTML={{ __html: line.content }}
            />
          </div>
        ))}
      </pre>
    </div>
  )
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function highlightLine(line) {
  let result = ''
  let i = 0

  while (i < line.length) {
    const char = line[i]
    const rest = line.slice(i)

    // Whitespace - preserve as-is
    if (char === ' ' || char === '\t') {
      result += char
      i++
      continue
    }

    // Brackets and braces
    if (char === '{' || char === '}') {
      result += `<span class="json-bracket">${char}</span>`
      i++
      continue
    }

    if (char === '[' || char === ']') {
      result += `<span class="json-bracket">${char}</span>`
      i++
      continue
    }

    // Colon
    if (char === ':') {
      result += `<span class="json-colon">:</span>`
      i++
      continue
    }

    // Comma
    if (char === ',') {
      result += `<span class="json-comma">,</span>`
      i++
      continue
    }

    // String (key or value)
    if (char === '"') {
      let str = '"'
      i++
      
      while (i < line.length) {
        const c = line[i]
        
        if (c === '\\' && i + 1 < line.length) {
          // Escape sequence
          str += c + line[i + 1]
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

      // Check if this string is a key (followed by colon)
      let j = i
      while (j < line.length && (line[j] === ' ' || line[j] === '\t')) {
        j++
      }
      
      const isKey = line[j] === ':'
      const escapedStr = escapeHtml(str)
      
      if (isKey) {
        result += `<span class="json-key">${escapedStr}</span>`
      } else {
        result += `<span class="json-string">${escapedStr}</span>`
      }
      continue
    }

    // Number
    const numberMatch = rest.match(/^-?\d+\.?\d*([eE][+-]?\d+)?/)
    if (numberMatch) {
      result += `<span class="json-number">${numberMatch[0]}</span>`
      i += numberMatch[0].length
      continue
    }

    // Boolean: true
    if (rest.startsWith('true')) {
      result += `<span class="json-boolean">true</span>`
      i += 4
      continue
    }

    // Boolean: false
    if (rest.startsWith('false')) {
      result += `<span class="json-boolean">false</span>`
      i += 5
      continue
    }

    // Null
    if (rest.startsWith('null')) {
      result += `<span class="json-null">null</span>`
      i += 4
      continue
    }

    // Any other character
    result += escapeHtml(char)
    i++
  }

  return result
}

export default JsonHighlighter