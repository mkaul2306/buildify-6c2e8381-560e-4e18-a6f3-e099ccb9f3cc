
import React, { useState } from 'react'
import { LineChart } from './components/LineChart'
import { Card } from './components/ui/Card'

function App() {
  // Dummy data for the line chart
  const [data] = useState([
    { date: '2025-01-01', count: 12 },
    { date: '2025-02-01', count: 19 },
    { date: '2025-03-01', count: 15 },
    { date: '2025-04-01', count: 25 },
    { date: '2025-05-01', count: 32 },
    { date: '2025-06-01', count: 28 },
    { date: '2025-07-01', count: 40 },
  ])

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Analytics Dashboard
        </h1>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Data Trend</h2>
          <div className="h-80">
            <LineChart data={data} />
          </div>
        </Card>
      </div>
    </div>
  )
}

export default App