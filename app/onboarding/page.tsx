'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    email: '',
    phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
    }
    if (!formData.timeOfBirth) {
      newErrors.timeOfBirth = 'Time of birth is required'
    }
    if (!formData.placeOfBirth.trim()) {
      newErrors.placeOfBirth = 'Place of birth is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/generate-reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          dateOfBirth: formData.dateOfBirth,
          timeOfBirth: formData.timeOfBirth,
          placeOfBirth: formData.placeOfBirth,
          email: formData.email,
          phone: formData.phone,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate reading')
      }

      const result = await response.json()

      // Store data in session storage and redirect to chat
      sessionStorage.setItem(
        'chatSession',
        JSON.stringify({
          birthChart: result.birthChart,
          reading: result.reading,
          userInfo: formData,
          sessionId: 'astro-6', // Default session ID
          messages: []
        })
      )

      router.push('/chat')
    } catch (error) {
      console.error('Error:', error)
      setErrors({
        submit: 'Failed to generate reading. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-black">
      {/* Header */}
      <div className="border-b border-purple-800/30 bg-purple-950/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a href="/" className="text-2xl font-bold text-amber-300 hover:text-amber-400">
            Jyotish AI
          </a>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-purple-700/50 p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 text-center">
            Your Cosmic Profile
          </h1>
          <p className="text-center text-purple-300 mb-8 text-balance">
            Enter your birth details to start your personalized Vedic astrology chat session
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-purple-300 mb-2">
                Full Name
              </label>
              <Input
                type="text"
                name="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                className="bg-purple-950/50 border-purple-700/50 text-white placeholder:text-purple-500 focus:border-amber-300"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Date of Birth and Time of Birth */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-purple-300 mb-2">
                  Date of Birth
                </label>
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="bg-purple-950/50 border-purple-700/50 text-white focus:border-amber-300"
                />
                {errors.dateOfBirth && (
                  <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-purple-300 mb-2">
                  Time of Birth (24hr)
                </label>
                <Input
                  type="time"
                  name="timeOfBirth"
                  value={formData.timeOfBirth}
                  onChange={handleChange}
                  className="bg-purple-950/50 border-purple-700/50 text-white focus:border-amber-300"
                />
                {errors.timeOfBirth && (
                  <p className="text-red-400 text-sm mt-1">{errors.timeOfBirth}</p>
                )}
              </div>
            </div>

            {/* Place of Birth */}
            <div>
              <label className="block text-sm font-semibold text-purple-300 mb-2">
                Place of Birth (City, Country)
              </label>
              <Input
                type="text"
                name="placeOfBirth"
                placeholder="e.g., New York, USA"
                value={formData.placeOfBirth}
                onChange={handleChange}
                className="bg-purple-950/50 border-purple-700/50 text-white placeholder:text-purple-500 focus:border-amber-300"
              />
              {errors.placeOfBirth && (
                <p className="text-red-400 text-sm mt-1">{errors.placeOfBirth}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-purple-300 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                name="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                className="bg-purple-950/50 border-purple-700/50 text-white placeholder:text-purple-500 focus:border-amber-300"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-purple-300 mb-2">
                Phone Number (Optional)
              </label>
              <Input
                type="tel"
                name="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                className="bg-purple-950/50 border-purple-700/50 text-white placeholder:text-purple-500 focus:border-amber-300"
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-950/30 border border-red-700/50 rounded-lg p-4">
                <p className="text-red-300 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-300 text-purple-950 hover:bg-amber-400 font-semibold text-base h-12"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-purple-950 border-t-purple-300 rounded-full animate-spin"></div>
                  Setting up your chat session...
                </span>
              ) : (
                'Start Chat Session'
              )}
            </Button>

            <p className="text-center text-sm text-purple-400">
              Your data is processed securely and never stored.
            </p>
          </form>
        </Card>
      </div>
    </main>
  )
}
