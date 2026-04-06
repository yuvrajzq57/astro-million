'use client'

import { Reading } from '@/lib/groq'
import { Card } from '@/components/ui/card'

interface ReadingCardProps {
  reading: Reading
}

export function ReadingCard({ reading }: ReadingCardProps) {
  return (
    <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border-purple-700/50 p-6">
      <h2 className="text-2xl font-bold text-amber-300 mb-6">
        Vedic Astrological Insights
      </h2>

      <div className="space-y-4">
        <div className="bg-purple-950/40 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-purple-300 mb-2 uppercase">
            Overview
          </h3>
          <p className="text-purple-100 leading-relaxed">{reading.overview}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="bg-purple-950/40 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-amber-300 mb-2 uppercase">
              Lucky Colour
            </h3>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full border-2 border-purple-400"
                style={{
                  backgroundColor: reading.luckyColour.toLowerCase(),
                }}
              ></div>
              <p className="text-lg font-bold text-purple-100">
                {reading.luckyColour}
              </p>
            </div>
          </div>

          <div className="bg-purple-950/40 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-green-300 mb-2 uppercase">
              Focus On
            </h3>
            <p className="text-purple-100 font-medium">{reading.focus}</p>
          </div>

          <div className="bg-purple-950/40 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-red-300 mb-2 uppercase">
              Avoid
            </h3>
            <p className="text-purple-100 font-medium">{reading.avoid}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
