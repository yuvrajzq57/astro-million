'use client'

import { useEffect, useState } from 'react'

const steps = [
  { label: 'Calculating your birth chart...', description: 'Analyzing planetary positions' },
  { label: 'Mapping celestial influences...', description: 'Processing house placements' },
  { label: 'Generating personalized reading...', description: 'Crafting your Vedic insights' },
]

export function LoadingSteps() {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-black">
      <div className="text-center space-y-8 max-w-md">
        {/* Animated Loading Circle */}
        <div className="flex justify-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-purple-800 border-t-amber-300 border-r-amber-300 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-2 border-purple-700/50"></div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`transition-all duration-500 ${
                index === currentStep
                  ? 'opacity-100 scale-100'
                  : 'opacity-50 scale-95'
              }`}
            >
              <h3 className="text-lg font-semibold text-amber-300 mb-1">
                {step.label}
              </h3>
              <p className="text-sm text-purple-300">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                index === currentStep ? 'bg-amber-300 w-8' : 'bg-purple-600'
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}
