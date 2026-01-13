import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Panel, Button } from '../../UI'
import styles from '../Tools.module.css'
import timeStyles from './TimeUtils.module.css'

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: 0 },
  { value: 'America/New_York', label: 'New York (EST/EDT)', offset: -5 },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)', offset: -6 },
  { value: 'America/Denver', label: 'Denver (MST/MDT)', offset: -7 },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)', offset: -8 },
  { value: 'America/Toronto', label: 'Toronto (EST/EDT)', offset: -5 },
  { value: 'America/Vancouver', label: 'Vancouver (PST/PDT)', offset: -8 },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', offset: -3 },
  { value: 'Europe/London', label: 'London (GMT/BST)', offset: 0 },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)', offset: 1 },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', offset: 1 },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)', offset: 3 },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 4 },
  { value: 'Asia/Kolkata', label: 'India (IST)', offset: 5.5 },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 8 },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', offset: 8 },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: 8 },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 9 },
  { value: 'Asia/Seoul', label: 'Seoul (KST)', offset: 9 },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)', offset: 10 },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)', offset: 12 },
]

function TimezoneConverter() {
  const [dateTime, setDateTime] = useState('')
  const [fromZone, setFromZone] = useState('UTC')
  const [selectedZones, setSelectedZones] = useState(['America/New_York', 'Europe/London', 'Asia/Tokyo'])
  const [results, setResults] = useState([])
  const [liveMode, setLiveMode] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Live clock update
  useEffect(() => {
    if (liveMode) {
      const interval = setInterval(() => {
        setCurrentTime(new Date())
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [liveMode])

  // Auto-convert in live mode
  useEffect(() => {
    if (liveMode) {
      convertTime(currentTime)
    }
  }, [currentTime, liveMode, selectedZones])

  const convertTime = (inputDate = null) => {
    let date
    
    if (inputDate) {
      date = inputDate
    } else if (!dateTime.trim()) {
      toast.error('Please enter a date and time')
      return
    } else {
      date = new Date(dateTime)
    }

    if (isNaN(date.getTime())) {
      toast.error('Invalid date format')
      return
    }

    const converted = selectedZones.map(zone => {
      try {
        const formatted = new Intl.DateTimeFormat('en-US', {
          timeZone: zone,
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          timeZoneName: 'short',
        }).format(date)

        const tzInfo = TIMEZONES.find(tz => tz.value === zone)
        
        return {
          zone,
          label: tzInfo?.label || zone,
          formatted,
          date: date,
        }
      } catch (error) {
        return {
          zone,
          label: zone,
          formatted: 'Error converting',
          error: true,
        }
      }
    })

    setResults(converted)
    if (!liveMode) {
      toast.success('Converted successfully!')
    }
  }

  const toggleZone = (zone) => {
    if (selectedZones.includes(zone)) {
      if (selectedZones.length > 1) {
        setSelectedZones(selectedZones.filter(z => z !== zone))
      }
    } else {
      setSelectedZones([...selectedZones, zone])
    }
  }

  const useNow = () => {
    const now = new Date()
    setDateTime(now.toISOString().slice(0, 16))
  }

  const copyResult = async (text) => {
    await navigator.clipboard.writeText(text)
    toast.success('Copied!')
  }

  return (
    <motion.div
      className={styles.toolPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Controls */}
      <div className={styles.controls}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={liveMode}
            onChange={(e) => setLiveMode(e.target.checked)}
          />
          <span>🔴 Live Mode (show current time)</span>
        </label>
      </div>

      {!liveMode && (
        <Panel title="Input Date & Time">
          <div className={timeStyles.converterSection}>
            <div className={timeStyles.inputRow}>
              <input
                type="datetime-local"
                className={timeStyles.input}
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
              />
              <select
                className={timeStyles.select}
                value={fromZone}
                onChange={(e) => setFromZone(e.target.value)}
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
            
            <div className={timeStyles.buttonRow}>
              <Button variant="primary" onClick={() => convertTime()}>
                Convert
              </Button>
              <Button variant="ghost" onClick={useNow}>
                Use Now
              </Button>
            </div>
          </div>
        </Panel>
      )}

      {/* Timezone Selection */}
      <Panel title="Select Timezones to Display">
        <div className={timeStyles.timezoneGrid}>
          {TIMEZONES.map(tz => (
            <button
              key={tz.value}
              className={`${timeStyles.timezoneChip} ${selectedZones.includes(tz.value) ? timeStyles.selected : ''}`}
              onClick={() => toggleZone(tz.value)}
            >
              {tz.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </Panel>

      {/* Results */}
      {results.length > 0 && (
        <Panel title={liveMode ? "Current Time Across Timezones" : "Converted Times"}>
          <div className={timeStyles.resultsGrid}>
            {results.map(result => (
              <motion.div
                key={result.zone}
                className={timeStyles.timezoneCard}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => copyResult(result.formatted)}
              >
                <span className={timeStyles.timezoneCardLabel}>{result.label}</span>
                <span className={timeStyles.timezoneCardValue}>{result.formatted}</span>
              </motion.div>
            ))}
          </div>
          <p className={timeStyles.clickHint}>Click any card to copy</p>
        </Panel>
      )}
    </motion.div>
  )
}

export default TimezoneConverter