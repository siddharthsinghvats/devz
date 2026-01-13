import { forwardRef, useRef, useEffect } from 'react'
import styles from './CodeEditor.module.css'

const CodeEditor = forwardRef(({
  value,
  onChange,
  placeholder,
  readOnly = false,
  error = false,
  minHeight = 200,
  maxHeight = 600,
  showStats = true,
}, ref) => {
  const textareaRef = useRef(null)
  const combinedRef = ref || textareaRef

  // Auto-resize textarea
  useEffect(() => {
    const textarea = combinedRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)
      textarea.style.height = `${newHeight}px`
    }
  }, [value, minHeight, maxHeight])

  const stats = value ? {
    chars: value.length,
    lines: value.split('\n').length,
    bytes: new Blob([value]).size,
  } : null

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.container} ${error ? styles.error : ''}`}>
        <textarea
          ref={combinedRef}
          className={styles.textarea}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          spellCheck={false}
          style={{ minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px` }}
        />
      </div>
      {showStats && stats && (
        <div className={styles.stats}>
          <span>{stats.chars.toLocaleString()} chars</span>
          <span>•</span>
          <span>{stats.lines} lines</span>
          <span>•</span>
          <span>{stats.bytes.toLocaleString()} bytes</span>
        </div>
      )}
    </div>
  )
})

CodeEditor.displayName = 'CodeEditor'

export default CodeEditor