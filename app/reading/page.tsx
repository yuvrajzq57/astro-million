'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BirthChartCard } from '@/components/birth-chart-card'
import { ReadingCard } from '@/components/reading-card'
import { GuidanceCard } from '@/components/guidance-card'
import { LoadingSteps } from '@/components/loading-steps'
import { BirthChart } from '@/lib/astrology'
import { Reading } from '@/lib/groq'

interface UserReading {
  birthChart: BirthChart
  reading: Reading
  userInfo: {
    name: string
    dateOfBirth: string
    timeOfBirth: string
    placeOfBirth: string
    email: string
    phone: string
  }
}

export default function ReadingPage() {
  const router = useRouter()
  const [data, setData] = useState<UserReading | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get data from session storage
    const stored = sessionStorage.getItem('userReading')

    if (stored) {
      try {
        const parsedData = JSON.parse(stored)
        setData(parsedData)
      } catch (error) {
        console.error('Failed to parse stored data:', error)
        router.push('/onboarding')
      }
    } else {
      router.push('/onboarding')
    }

    setLoading(false)
  }, [router])

  if (loading) {
    return <LoadingSteps />
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-purple-300 mb-4">No reading data found</p>
          <Link href="/onboarding">
            <Button className="bg-amber-300 text-purple-950 hover:bg-amber-400">
              Generate a Reading
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-black">
      {/* Header */}
      <div className="border-b border-purple-800/30 bg-purple-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-amber-300 hover:text-amber-400">
            Jyotish AI
          </a>
          <div className="flex gap-4">
            <Link href="/onboarding">
              <Button
                variant="outline"
                className="text-purple-300 border-purple-600 hover:bg-purple-800/50"
              >
                New Reading
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Welcome Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Welcome, <span className="text-amber-300">{data.userInfo.name}</span>
          </h1>
          <p className="text-lg text-purple-300 text-balance">
            Your cosmic reading is ready. Discover the wisdom written in the stars.
          </p>
        </div>

        {/* Main Cards Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Birth Chart Card */}
          <BirthChartCard birthChart={data.birthChart} />

          {/* Reading Card */}
          <ReadingCard reading={data.reading} />
        </div>

        {/* Guidance Cards */}
        <div className="space-y-6 mb-12">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Your Personalized Guidance
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <GuidanceCard
              title="Lucky Colour"
              content={`Wearing or surrounding yourself with ${data.reading.luckyColour} can enhance positive vibrations and attract auspicious energies into your life.`}
              icon="🎨"
            />

            <GuidanceCard
              title="Area of Focus"
              content={`Dedicate your energy to ${data.reading.focus.toLowerCase()}. This is where you will find the greatest success and fulfillment.`}
              icon="🎯"
            />

            <GuidanceCard
              title="Things to Avoid"
              content={`Be cautious about ${data.reading.avoid.toLowerCase()}. Understanding this helps you navigate life's challenges more smoothly.`}
              icon="⚠️"
            />

            <GuidanceCard
              title="Cosmic Message"
              content={`Your birth chart reveals a unique interplay of cosmic forces. Trust in this ancient wisdom and let it guide your decisions and actions.`}
              icon="✨"
            />
          </div>
        </div>

        {/* Personal Info Display */}
        <div className="bg-purple-950/40 border border-purple-700/50 rounded-lg p-8 mb-12">
          <h3 className="text-xl font-semibold text-amber-300 mb-6">
            Your Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-6 text-purple-200">
            <div>
              <p className="text-sm text-purple-400 mb-1">Name</p>
              <p className="font-semibold">{data.userInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-purple-400 mb-1">Date of Birth</p>
              <p className="font-semibold">{data.userInfo.dateOfBirth}</p>
            </div>
            <div>
              <p className="text-sm text-purple-400 mb-1">Time of Birth</p>
              <p className="font-semibold">{data.userInfo.timeOfBirth}</p>
            </div>
            <div>
              <p className="text-sm text-purple-400 mb-1">Place of Birth</p>
              <p className="font-semibold">{data.userInfo.placeOfBirth}</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-6 py-12 border-t border-purple-700/50">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Explore More Insights
            </h3>
            <p className="text-purple-300">
              Generate another reading with different birth details
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding">
              <Button className="bg-amber-300 text-purple-950 hover:bg-amber-400 font-semibold">
                Generate Another Reading
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                className="text-purple-300 border-purple-600 hover:bg-purple-800/50"
              >
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
