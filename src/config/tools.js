export const toolCategories = [
  {
    id: 'json-utils',
    title: 'JSON Utils',
    icon: '{ }',
    tools: [
      {
        path: '/json-formatter',
        name: 'Formatter',
        description: 'Beautify and format JSON',
        icon: '✨',
        color: '#6366f1',
      },
      {
        path: '/json-minifier',
        name: 'Minifier',
        description: 'Compress JSON',
        icon: '⚡',
        color: '#f59e0b',
      },
      {
        path: '/json-validator',
        name: 'Validator',
        description: 'Validate JSON syntax',
        icon: '✓',
        color: '#22c55e',
      },
      {
        path: '/json-diff',
        name: 'Diff Viewer',
        description: 'Compare two JSON objects',
        icon: '◫',
        color: '#ec4899',
      },
      {
        path: '/json-to-yaml',
        name: 'JSON ↔ YAML',
        description: 'Convert between formats',
        icon: '⇄',
        color: '#3b82f6',
      },
      {
        path: '/json-to-csv',
        name: 'JSON → CSV',
        description: 'Convert to CSV',
        icon: '▤',
        color: '#14b8a6',
      },
      {
        path: '/json-to-typescript',
        name: 'JSON → TypeScript',
        description: 'Generate interfaces',
        icon: 'TS',
        color: '#3178c6',
      },
      {
        path: '/json-escape',
        name: 'Escape / Unescape',
        description: 'Escape JSON strings',
        icon: '\\',
        color: '#f97316',
      },
      {
        path: '/json-tree',
        name: 'Tree Viewer',
        description: 'Visualize as tree',
        icon: '🌳',
        color: '#22c55e',
      },
      {
        path: '/json-epoch-converter',
        name: 'Epoch Converter',
        description: 'Convert epoch timestamps to human dates',
        icon: '🕐',
        color: '#8b5cf6',
      },
      {
        path: '/class-to-json',
        name: 'Class to JSON',
        description: 'Convert class entries to JSON',
        icon: '📋',
        color: '#f43f5e',
      }
    ],
  },
  {
    id: 'time-utils',
    title: 'Time Utils',
    icon: '🕐',
    tools: [
      {
        path: '/timestamp-converter',
        name: 'Timestamp Converter',
        description: 'Convert between epoch and human dates',
        icon: '⏱️',
        color: '#8b5cf6',
      },
      {
        path: '/timezone-converter',
        name: 'Timezone Converter',
        description: 'Convert times between timezones',
        icon: '🌍',
        color: '#06b6d4',
      },
      {
        path: '/date-calculator',
        name: 'Date Calculator',
        description: 'Calculate date differences',
        icon: '📅',
        color: '#10b981',
      },
    ],
  },
  // Future categories
  // {
  //   id: 'encode-decode',
  //   title: 'Encode / Decode',
  //   icon: '🔐',
  //   tools: []
  // },
]

export const getAllTools = () => {
  return toolCategories.flatMap(cat => cat.tools)
}

export const getToolByPath = (path) => {
  return getAllTools().find(t => t.path === path)
}