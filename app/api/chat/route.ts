import { NextRequest, NextResponse } from 'next/server'
import { getBirthChart } from '@/lib/astrology'

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, userInfo } = await request.json()

    if (!message || !sessionId || !userInfo) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('[v0] Chat request:', { message, sessionId, userInfo })

    // Get birth chart data for the user
    const birthChart = await getBirthChart({
      name: userInfo.name,
      dateOfBirth: userInfo.dateOfBirth,
      timeOfBirth: userInfo.timeOfBirth,
      placeOfBirth: userInfo.placeOfBirth,
    })

    // Parse date and time for API
    const [year, month, day] = userInfo.dateOfBirth.split('-').map(Number)
    const [hour, min] = userInfo.timeOfBirth.split(':').map(Number)

    console.log('[v0] Calling Astrology Chat API with:', { 
      day, 
      month, 
      year, 
      hour, 
      min, 
      place: userInfo.placeOfBirth,
      message 
    })

    // Call the astrology chat API
    const apiKey = process.env.ASTROLOGY_API_KEY

    if (!apiKey) {
      throw new Error('ASTROLOGY_API_KEY environment variable is not set')
    }

    const requestData = {
      language: "en",
      name: userInfo.name,
      day: day,
      month: month,
      year: year,
      hour: hour,
      min: min,
      place: userInfo.placeOfBirth,
      lat: "19.17", // Default latitude
      lon: "73.7", // Default longitude
      tzone: "5.5",
      gender: "male",
      country: "INDIA",
      ap: "KUNDLI",
      sid: sessionId, // Use the session ID
      ep: "STANDARD",
      ac: "VEDIC",
      q: message.toLowerCase()
    }

    const response = await fetch(
      'https://json-chat.astrologyapi.com/api/chat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-astrologyapi-key': apiKey,
        },
        body: JSON.stringify(requestData),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[v0] Astrology Chat API error response:', errorText)
      throw new Error(`Astrology Chat API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('[v0] Astrology Chat API response:', data)

    if (data.success && data.response) {
      return NextResponse.json({
        response: data.response,
        sessionId: data.session_id || sessionId,
        birthChart: birthChart
      })
    } else {
      throw new Error(data.msg || 'Failed to get response from astrology API')
    }

  } catch (error) {
    console.error('[v0] Chat API error:', error)
    
    // Return a fallback response
    return NextResponse.json({
      response: "I apologize, but I'm having trouble connecting to the astrology service right now. Please try again in a moment. In the meantime, remember that the cosmos is always guiding you toward your highest good.",
      sessionId: "astro-6"
    })
  }
}
