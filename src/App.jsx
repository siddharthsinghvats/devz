import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import {
  JsonFormatter,
  JsonMinifier,
  JsonValidator,
  JsonToYaml,
  JsonToCsv,
  JsonDiff,
  JsonToTs,
  JsonEscape,
  JsonTreeViewer,
} from './components/Tools'
import {
  TimestampConverter,
  TimezoneConverter,
  DateCalculator,
} from './components/Tools/TimeUtils'
import './App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="app">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div 
        className="main-wrapper"
        style={{ 
          marginLeft: sidebarOpen ? '260px' : '56px',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <Header />
        <main className="main-content">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Navigate to="/json-formatter" replace />} />
              
              {/* JSON Utils */}
              <Route path="/json-formatter" element={<JsonFormatter />} />
              <Route path="/json-minifier" element={<JsonMinifier />} />
              <Route path="/json-validator" element={<JsonValidator />} />
              <Route path="/json-to-yaml" element={<JsonToYaml />} />
              <Route path="/json-to-csv" element={<JsonToCsv />} />
              <Route path="/json-diff" element={<JsonDiff />} />
              <Route path="/json-to-typescript" element={<JsonToTs />} />
              <Route path="/json-escape" element={<JsonEscape />} />
              <Route path="/json-tree" element={<JsonTreeViewer />} />
              
              {/* Time Utils */}
              <Route path="/timestamp-converter" element={<TimestampConverter />} />
              <Route path="/timezone-converter" element={<TimezoneConverter />} />
              <Route path="/date-calculator" element={<DateCalculator />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default App