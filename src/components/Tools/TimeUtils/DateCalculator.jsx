import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Panel, Button, Badge } from '../../UI'
import styles from '../Tools.module.css'
import timeStyles from './TimeUtils.module.css'

function DateCalculator() {
  // Date Difference
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [difference, setDifference] = useState(null)

  // Add/Subtract
  const [baseDate, setBaseDate] = useState('')
  const [amount, setAmount] = useState('')
  const [unit, setUnit] = useState('days')
  const [operation, setOperation] = useState('add')
  const [calculatedDate, setCalculatedDate] = useState(null)

  const calculateDifference = () => {
    if (!startDate || !endDate) {
      toast.error('Please select both dates')
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toast.error('Invalid date')
      return
    }

    const diffMs = Math.abs(end - start)
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30.44) // Average days per month
    const diffYears = Math.floor(diffDays / 365.25)

    // Detailed breakdown
    const years = Math.floor(diffDays / 365)
    const remainingDaysAfterYears = diffDays % 365
    const months = Math.floor(remainingDaysAfterYears / 30)
    const days = remainingDaysAfterYears % 30

    setDifference({
      totalMilliseconds: diffMs,
      totalSeconds: diffSeconds,
      totalMinutes: diffMinutes,
      totalHours: diffHours,
      totalDays: diffDays,
      totalWeeks: diffWeeks,
      totalMonths: diffMonths,
      totalYears: diffYears,
      breakdown: { years, months, days },
      isPast: end < start,
    })

    toast.success('Calculated!')
  }

  const calculateNewDate = () => {
    if (!baseDate || !amount) {
      toast.error('Please enter date and amount')
      return
    }

    const date = new Date(baseDate)
    const num = parseInt(amount, 10) * (operation === 'subtract' ? -1 : 1)

    if (isNaN(date.getTime()) || isNaN(num)) {
      toast.error('Invalid input')
      return
    }

    let result = new Date(date)

    switch (unit) {
      case 'seconds':
        result.setSeconds(result.getSeconds() + num)
        break
      case 'minutes':
        result.setMinutes(result.getMinutes() + num)
        break
      case 'hours':
        result.setHours(result.getHours() + num)
        break
      case 'days':
        result.setDate(result.getDate() + num)
        break
      case 'weeks':
        result.setDate(result.getDate() + (num * 7))
        break
      case 'months':
        result.setMonth(result.getMonth() + num)
        break
      case 'years':
        result.setFullYear(result.getFullYear() + num)
        break
      default:
        break
    }

    setCalculatedDate({
      date: result,
      iso: result.toISOString(),
      local: result.toLocaleString(),
      formatted: result.toDateString(),
      epoch: Math.floor(result.getTime() / 1000),
    })

    toast.success('Calculated!')
  }

  const useToday = (setter) => {
    const today = new Date().toISOString().slice(0, 10)
    setter(today)
  }

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(String(text))
    toast.success('Copied!')
  }

  return (
    <motion.div
      className={styles.toolPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className={styles.gridAuto}>
        {/* Date Difference Calculator */}
        <Panel title="📏 Date Difference">
          <div className={timeStyles.converterSection}>
            <div className={timeStyles.dateInputGroup}>
              <label className={timeStyles.inputLabel}>Start Date</label>
              <div className={timeStyles.inputRow}>
                <input
                  type="date"
                  className={timeStyles.input}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Button size="small" variant="ghost" onClick={() => useToday(setStartDate)}>
                  Today
                </Button>
              </div>
            </div>

            <div className={timeStyles.dateInputGroup}>
              <label className={timeStyles.inputLabel}>End Date</label>
              <div className={timeStyles.inputRow}>
                <input
                  type="date"
                  className={timeStyles.input}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <Button size="small" variant="ghost" onClick={() => useToday(setEndDate)}>
                  Today
                </Button>
              </div>
            </div>

            <Button variant="primary" onClick={calculateDifference}>
              Calculate Difference
            </Button>

            {difference && (
              <motion.div
                className={timeStyles.resultCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={timeStyles.breakdownHighlight}>
                  <span className={timeStyles.breakdownValue}>
                    {difference.breakdown.years > 0 && `${difference.breakdown.years}y `}
                    {difference.breakdown.months > 0 && `${difference.breakdown.months}m `}
                    {difference.breakdown.days}d
                  </span>
                  <Badge variant="info">
                    {difference.totalDays.toLocaleString()} days total
                  </Badge>
                </div>

                <div className={timeStyles.statsGrid}>
                  <div className={timeStyles.statItem} onClick={() => copyToClipboard(difference.totalYears)}>
                    <span className={timeStyles.statValue}>{difference.totalYears}</span>
                    <span className={timeStyles.statLabel}>Years</span>
                  </div>
                  <div className={timeStyles.statItem} onClick={() => copyToClipboard(difference.totalMonths)}>
                    <span className={timeStyles.statValue}>{difference.totalMonths}</span>
                    <span className={timeStyles.statLabel}>Months</span>
                  </div>
                  <div className={timeStyles.statItem} onClick={() => copyToClipboard(difference.totalWeeks)}>
                    <span className={timeStyles.statValue}>{difference.totalWeeks}</span>
                    <span className={timeStyles.statLabel}>Weeks</span>
                  </div>
                  <div className={timeStyles.statItem} onClick={() => copyToClipboard(difference.totalDays)}>
                    <span className={timeStyles.statValue}>{difference.totalDays.toLocaleString()}</span>
                    <span className={timeStyles.statLabel}>Days</span>
                  </div>
                  <div className={timeStyles.statItem} onClick={() => copyToClipboard(difference.totalHours)}>
                    <span className={timeStyles.statValue}>{difference.totalHours.toLocaleString()}</span>
                    <span className={timeStyles.statLabel}>Hours</span>
                  </div>
                  <div className={timeStyles.statItem} onClick={() => copyToClipboard(difference.totalMinutes)}>
                    <span className={timeStyles.statValue}>{difference.totalMinutes.toLocaleString()}</span>
                    <span className={timeStyles.statLabel}>Minutes</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </Panel>

        {/* Add/Subtract from Date */}
        <Panel title="➕ Add / Subtract Time">
          <div className={timeStyles.converterSection}>
            <div className={timeStyles.dateInputGroup}>
              <label className={timeStyles.inputLabel}>Base Date</label>
              <div className={timeStyles.inputRow}>
                <input
                  type="datetime-local"
                  className={timeStyles.input}
                  value={baseDate}
                  onChange={(e) => setBaseDate(e.target.value)}
                />
                <Button size="small" variant="ghost" onClick={() => setBaseDate(new Date().toISOString().slice(0, 16))}>
                  Now
                </Button>
              </div>
            </div>

            <div className={timeStyles.inputRow}>
              <select
                className={timeStyles.select}
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
              >
                <option value="add">Add (+)</option>
                <option value="subtract">Subtract (−)</option>
              </select>
              <input
                type="number"
                className={timeStyles.input}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                min="0"
              />
              <select
                className={timeStyles.select}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="seconds">Seconds</option>
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>

            <Button variant="primary" onClick={calculateNewDate}>
              Calculate
            </Button>

            {calculatedDate && (
              <motion.div
                className={timeStyles.resultCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={timeStyles.resultRow}>
                  <span className={timeStyles.resultLabel}>Result</span>
                  <span className={timeStyles.resultValueLarge} onClick={() => copyToClipboard(calculatedDate.formatted)}>
                    {calculatedDate.formatted}
                  </span>
                </div>
                <div className={timeStyles.resultRow}>
                  <span className={timeStyles.resultLabel}>Local</span>
                  <span className={timeStyles.resultValue} onClick={() => copyToClipboard(calculatedDate.local)}>
                    {calculatedDate.local}
                  </span>
                </div>
                <div className={timeStyles.resultRow}>
                  <span className={timeStyles.resultLabel}>ISO 8601</span>
                  <span className={timeStyles.resultValue} onClick={() => copyToClipboard(calculatedDate.iso)}>
                    {calculatedDate.iso}
                  </span>
                </div>
                <div className={timeStyles.resultRow}>
                  <span className={timeStyles.resultLabel}>Epoch</span>
                  <span className={timeStyles.resultValue} onClick={() => copyToClipboard(calculatedDate.epoch)}>
                    {calculatedDate.epoch}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </Panel>
      </div>

      {/* Quick Add Buttons */}
      <Panel title="⚡ Quick Add to Current Date">
        <div className={timeStyles.quickButtonsGrid}>
          {[
            { label: '+1 Day', days: 1 },
            { label: '+1 Week', days: 7 },
            { label: '+2 Weeks', days: 14 },
            { label: '+1 Month', days: 30 },
            { label: '+3 Months', days: 90 },
            { label: '+6 Months', days: 180 },
            { label: '+1 Year', days: 365 },
            { label: '−1 Day', days: -1 },
            { label: '−1 Week', days: -7 },
            { label: '−1 Month', days: -30 },
          ].map((item) => {
            const result = new Date()
            result.setDate(result.getDate() + item.days)
            return (
              <div
                key={item.label}
                className={timeStyles.quickButton}
                onClick={() => copyToClipboard(result.toISOString())}
              >
                <span className={timeStyles.quickButtonLabel}>{item.label}</span>
                <span className={timeStyles.quickButtonValue}>{result.toLocaleDateString()}</span>
              </div>
            )
          })}
        </div>
        <p className={timeStyles.clickHint}>Click to copy ISO date</p>
      </Panel>
    </motion.div>
  )
}

export default DateCalculator