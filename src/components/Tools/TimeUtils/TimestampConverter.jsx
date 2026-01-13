import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Panel, Button, Badge } from '../../UI'
import styles from '../Tools.module.css'
import timeStyles from './TimeUtils.module.css'

function TimestampConverter() {
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [epochInput, setEpochInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [epochUnit, setEpochUnit] = useState('seconds')
  const [convertedFromEpoch, setConvertedFromEpoch] = useState(null)
  const [convertedFromDate, setConvertedFromDate] = useState(null)

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const currentEpochSeconds = Math.floor(currentTime / 1000)
  const currentEpochMs = currentTime

  const convertFromEpoch = () => {
    if (!epochInput.trim()) {
      toast.error('Please enter an epoch timestamp')
      return
    }

    try {
      let timestamp = parseInt(epochInput, 10)
      
      if (isNaN(timestamp)) {
        toast.error('Invalid timestamp')
        return
      }

      // Auto-detect if it's seconds or milliseconds
      if (epochUnit === 'seconds') {
        timestamp = timestamp * 1000
      }

      const date = new Date(timestamp)
      
      if (isNaN(date.getTime())) {
        toast.error('Invalid timestamp')
        return
      }

      setConvertedFromEpoch({
        iso: date.toISOString(),
        utc: date.toUTCString(),
        local: date.toLocaleString(),
        localFull: date.toString(),
        relative: getRelativeTime(date),
        date: date,
      })
      
      toast.success('Converted successfully!')
    } catch (error) {
      toast.error('Invalid timestamp')
    }
  }

  const convertFromDate = () => {
    if (!dateInput.trim()) {
      toast.error('Please enter a date')
      return
    }

    try {
      const date = new Date(dateInput)
      
      if (isNaN(date.getTime())) {
        toast.error('Invalid date format')
        return
      }

      setConvertedFromDate({
        seconds: Math.floor(date.getTime() / 1000),
        milliseconds: date.getTime(),
        iso: date.toISOString(),
      })
      
      toast.success('Converted successfully!')
    } catch (error) {
      toast.error('Invalid date format')
    }
  }

  const getRelativeTime = (date) => {
    const now = new Date()
    const diff = now - date
    const absDiff = Math.abs(diff)
    const isPast = diff > 0

    const seconds = Math.floor(absDiff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    let value, unit
    if (years > 0) { value = years; unit = 'year' }
    else if (months > 0) { value = months; unit = 'month' }
    else if (days > 0) { value = days; unit = 'day' }
    else if (hours > 0) { value = hours; unit = 'hour' }
    else if (minutes > 0) { value = minutes; unit = 'minute' }
    else { value = seconds; unit = 'second' }

    const plural = value !== 1 ? 's' : ''
    return isPast ? `${value} ${unit}${plural} ago` : `in ${value} ${unit}${plural}`
  }

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(String(text))
    toast.success('Copied to clipboard!')
  }

  const useCurrentTime = () => {
    setEpochInput(epochUnit === 'seconds' ? String(currentEpochSeconds) : String(currentEpochMs))
  }

  const useNowForDate = () => {
    const now = new Date()
    setDateInput(now.toISOString().slice(0, 16))
  }

  return (
    <motion.div
      className={styles.toolPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Current Time Display */}
      <div className={timeStyles.currentTime}>
        <div className={timeStyles.currentTimeHeader}>
          <span className={timeStyles.liveIndicator}>
            <span className={timeStyles.liveDot} />
            LIVE
          </span>
          <span className={timeStyles.currentTimeLabel}>Current Time</span>
        </div>
        <div className={timeStyles.currentTimeGrid}>
          <div className={timeStyles.timeCard} onClick={() => copyToClipboard(currentEpochSeconds)}>
            <span className={timeStyles.timeCardLabel}>Unix Timestamp (seconds)</span>
            <span className={timeStyles.timeCardValue}>{currentEpochSeconds}</span>
          </div>
          <div className={timeStyles.timeCard} onClick={() => copyToClipboard(currentEpochMs)}>
            <span className={timeStyles.timeCardLabel}>Unix Timestamp (ms)</span>
            <span className={timeStyles.timeCardValue}>{currentEpochMs}</span>
          </div>
          <div className={timeStyles.timeCard} onClick={() => copyToClipboard(new Date(currentTime).toISOString())}>
            <span className={timeStyles.timeCardLabel}>ISO 8601</span>
            <span className={timeStyles.timeCardValue}>{new Date(currentTime).toISOString()}</span>
          </div>
          <div className={timeStyles.timeCard} onClick={() => copyToClipboard(new Date(currentTime).toLocaleString())}>
            <span className={timeStyles.timeCardLabel}>Local Time</span>
            <span className={timeStyles.timeCardValue}>{new Date(currentTime).toLocaleString()}</span>
          </div>
        </div>
        <p className={timeStyles.clickHint}>Click any card to copy</p>
      </div>

      <div className={styles.gridAuto}>
        {/* Epoch to Date */}
        <Panel title="Epoch → Human Date">
          <div className={timeStyles.converterSection}>
            <div className={timeStyles.inputRow}>
              <input
                type="text"
                className={timeStyles.input}
                value={epochInput}
                onChange={(e) => setEpochInput(e.target.value)}
                placeholder="Enter epoch timestamp..."
              />
              <select
                className={timeStyles.select}
                value={epochUnit}
                onChange={(e) => setEpochUnit(e.target.value)}
              >
                <option value="seconds">Seconds</option>
                <option value="milliseconds">Milliseconds</option>
              </select>
            </div>
            
            <div className={timeStyles.buttonRow}>
              <Button variant="primary" onClick={convertFromEpoch}>
                Convert to Date
              </Button>
              <Button variant="ghost" onClick={useCurrentTime}>
                Use Current Time
              </Button>
            </div>

            {convertedFromEpoch && (
              <motion.div
                className={timeStyles.resultCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={timeStyles.resultRow}>
                  <span className={timeStyles.resultLabel}>ISO 8601</span>
                  <span className={timeStyles.resultValue} onClick={() => copyToClipboard(convertedFromEpoch.iso)}>
                    {convertedFromEpoch.iso}
                  </span>
                </div>
                <div className={timeStyles.resultRow}>
                  <span className={timeStyles.resultLabel}>UTC</span>
                  <span className={timeStyles.resultValue} onClick={() => copyToClipboard(convertedFromEpoch.utc)}>
                    {convertedFromEpoch.utc}
                  </span>
                </div>
                <div className={timeStyles.resultRow}>
                  <span className={timeStyles.resultLabel}>Local</span>
                  <span className={timeStyles.resultValue} onClick={() => copyToClipboard(convertedFromEpoch.local)}>
                    {convertedFromEpoch.local}
                  </span>
                </div>
                <div className={timeStyles.resultRow}>
                  <span className={timeStyles.resultLabel}>Relative</span>
                  <Badge variant="info">{convertedFromEpoch.relative}</Badge>
                </div>
              </motion.div>
            )}
          </div>
        </Panel>

        {/* Date to Epoch */}
        <Panel title="Human Date → Epoch">
          <div className={timeStyles.converterSection}>
            <div className={timeStyles.inputRow}>
              <input
                type="datetime-local"
                className={timeStyles.input}
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
              />
            </div>
            
            <p className={timeStyles.hint}>
              Or enter any date format: "2024-01-15", "Jan 15, 2024", "2024-01-15T10:30:00Z"
            </p>

            <input
              type="text"
              className={timeStyles.input}
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              placeholder="Or type date string..."
            />
            
            <div className={timeStyles.buttonRow}>
              <Button variant="primary" onClick={convertFromDate}>
                Convert to Epoch
              </Button>
              <Button variant="ghost" onClick={useNowForDate}>
                Use Now
              </Button>
            </div>

            {convertedFromDate && (
              <motion.div
                className={timeStyles.resultCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={timeStyles.resultRow}>
                  <span className={timeStyles.resultLabel}>Seconds</span>
                  <span className={timeStyles.resultValue} onClick={() => copyToClipboard(convertedFromDate.seconds)}>
                    {convertedFromDate.seconds}
                  </span>
                </div>
                <div className={timeStyles.resultRow}>
                  <span className={timeStyles.resultLabel}>Milliseconds</span>
                  <span className={timeStyles.resultValue} onClick={() => copyToClipboard(convertedFromDate.milliseconds)}>
                    {convertedFromDate.milliseconds}
                  </span>
                </div>
                <div className={timeStyles.resultRow}>
                  <span className={timeStyles.resultLabel}>ISO 8601</span>
                  <span className={timeStyles.resultValue} onClick={() => copyToClipboard(convertedFromDate.iso)}>
                    {convertedFromDate.iso}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </Panel>
      </div>

      {/* Common Timestamps Reference */}
      <Panel title="Common Timestamps Reference">
        <div className={timeStyles.referenceGrid}>
          {[
            { label: '1 minute', seconds: 60 },
            { label: '1 hour', seconds: 3600 },
            { label: '1 day', seconds: 86400 },
            { label: '1 week', seconds: 604800 },
            { label: '30 days', seconds: 2592000 },
            { label: '1 year', seconds: 31536000 },
          ].map((item) => (
            <div
              key={item.label}
              className={timeStyles.referenceCard}
              onClick={() => copyToClipboard(item.seconds)}
            >
              <span className={timeStyles.referenceLabel}>{item.label}</span>
              <span className={timeStyles.referenceValue}>{item.seconds.toLocaleString()} sec</span>
            </div>
          ))}
        </div>
      </Panel>
    </motion.div>
  )
}

export default TimestampConverter