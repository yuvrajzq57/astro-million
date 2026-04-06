'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-black text-foreground">
      {/* Navigation */}
      <nav className="border-b border-purple-800/30 bg-purple-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-amber-300">Cosmic AI</div>
          <div className="flex gap-2 sm:gap-4">
            <Link href="/onboarding">
              <Button
                variant="outline"
                size="sm"
                className="text-purple-300 border-purple-600 hover:bg-purple-800/50"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button
                size="sm"
                className="bg-amber-300 text-purple-950 hover:bg-amber-400"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white text-balance leading-tight">
              Discover Your Cosmic Blueprint
            </h1>
            <p className="text-lg sm:text-xl text-purple-300 text-balance">
              Ancient Vedic astrology meets modern AI. Chat with your personal 
              astrologer and get real-time insights from your birth chart.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/onboarding" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full bg-amber-300 text-purple-950 hover:bg-amber-400 font-semibold text-base"
              >
                Start Chat Session
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-purple-300 border-purple-600 hover:bg-purple-800/50"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Decorative Stars */}
        <div className="mt-16 relative">
          <div className="absolute -top-4 right-0 w-20 h-20 bg-amber-300/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-purple-950/50 border-y border-purple-800/30 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-4">
            What You&apos;ll Discover
          </h2>
          <p className="text-center text-purple-300 mb-12 text-balance max-w-2xl mx-auto">
            Our AI-powered Vedic astrology system analyzes your birth chart to
            provide personalized guidance
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '☀️',
                title: 'Birth Chart Analysis',
                description:
                  'Detailed calculation of your Sun, Moon, and Ascendant signs with precise planetary positions.',
              },
              {
                icon: '�',
                title: 'AI-Powered Chat',
                description:
                  'Have real-time conversations with your personal Vedic astrologer powered by advanced AI.',
              },
              {
                icon: '✨',
                title: 'Guidance & Direction',
                description:
                  'Discover your lucky colors, focus areas, and things to avoid based on your astrological profile.',
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-purple-700/50 p-6"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-amber-300 mb-3">
                  {feature.title}
                </h3>
                <p className="text-purple-200 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-4">
          How It Works
        </h2>
        <p className="text-center text-purple-300 mb-12 text-balance max-w-2xl mx-auto">
          Three simple steps to unlock your cosmic potential
        </p>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-purple-700 via-amber-300 to-purple-700"></div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: '1',
                title: 'Enter Your Details',
                description:
                  'Provide your birth date, time, and place for accurate calculation.',
              },
              {
                number: '2',
                title: 'We Calculate',
                description:
                  'Our AI processes your data to create your complete birth chart.',
              },
              {
                number: '3',
                title: 'Chat & Learn',
                description:
                  'Have real-time conversations with your AI astrologer for personalized guidance.',
              },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-200 text-purple-950 font-bold text-2xl mb-4 relative z-10">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-amber-300 mb-2">
                  {step.title}
                </h3>
                <p className="text-purple-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-t border-purple-700/50 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Discover Your Destiny?
            </h2>
            <p className="text-lg text-purple-300">
              Let the ancient wisdom of Vedic astrology guide your journey
            </p>
          </div>

          <Link href="/onboarding" className="inline-block">
            <Button
              size="lg"
              className="bg-amber-300 text-purple-950 hover:bg-amber-400 font-semibold text-base px-8"
            >
              Start Your Chat Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-800/30 bg-purple-950/50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-purple-400 text-sm">
          <p>
            &copy; 2024 Jyotish AI. Bridging ancient wisdom with modern
            technology.
          </p>
        </div>
      </footer>
    </main>
  )
}
