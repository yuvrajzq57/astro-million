'use client'

import { BirthChart } from '@/lib/astrology'
import { Card } from '@/components/ui/card'

interface BirthChartCardProps {
  birthChart: BirthChart
}

export function BirthChartCard({ birthChart }: BirthChartCardProps) {
  return (
    <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border-purple-700/50 p-6">
      <h2 className="text-2xl font-bold text-amber-300 mb-6">Your Birth Chart</h2>

      <div className="space-y-6">
        {/* Personal Details */}
        <div className="bg-purple-950/40 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-purple-300 mb-3">
            BIRTH INFORMATION
          </h3>
          <div className="space-y-2 text-sm text-purple-100">
            <p>
              <span className="text-purple-400">Name:</span> {birthChart.name}
            </p>
            <p>
              <span className="text-purple-400">Date:</span>{' '}
              {birthChart.dateOfBirth}
            </p>
            <p>
              <span className="text-purple-400">Time:</span>{' '}
              {birthChart.timeOfBirth}
            </p>
            <p>
              <span className="text-purple-400">Place:</span>{' '}
              {birthChart.placeOfBirth}
            </p>
          </div>
        </div>

        {/* Trimurti - Sun, Moon, Ascendant */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-purple-950/40 rounded-lg p-4 text-center">
            <h3 className="text-xs font-semibold text-yellow-300 mb-2 uppercase">
              Sun
            </h3>
            <p className="text-lg font-bold text-amber-300">
              {birthChart.sun.sign}
            </p>
            <p className="text-xs text-purple-300">
              {birthChart.sun.degree}°
            </p>
          </div>

          <div className="bg-purple-950/40 rounded-lg p-4 text-center">
            <h3 className="text-xs font-semibold text-cyan-300 mb-2 uppercase">
              Moon
            </h3>
            <p className="text-lg font-bold text-cyan-300">
              {birthChart.moon.sign}
            </p>
            <p className="text-xs text-purple-300">
              {birthChart.moon.degree}°
            </p>
          </div>

          <div className="bg-purple-950/40 rounded-lg p-4 text-center">
            <h3 className="text-xs font-semibold text-violet-300 mb-2 uppercase">
              Rising
            </h3>
            <p className="text-lg font-bold text-violet-300">
              {birthChart.ascendant.sign}
            </p>
            <p className="text-xs text-purple-300">
              {birthChart.ascendant.degree}°
            </p>
          </div>
        </div>

        {/* Houses Grid */}
        {birthChart.houses.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-purple-300 mb-3">
              HOUSE CUSPS
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {birthChart.houses.slice(0, 12).map((house) => (
                <div
                  key={house.number}
                  className="bg-purple-950/40 rounded p-2 text-center text-xs"
                >
                  <p className="font-semibold text-purple-400">H{house.number}</p>
                  <p className="text-purple-200">{house.sign}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
