import { NextRequest, NextResponse } from 'next/server'
import { getBirthChart } from '@/lib/astrology'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // WhatsApp webhook format
    const { 
      From: fromNumber, 
      Body: message, 
      FromUserName: userName = 'User' 
    } = body

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 })
    }

    console.log('[WhatsApp] Message from', fromNumber, ':', message)

    // Extract user info from session or create default
    // In production, you'd store/retrieve user data from a database
    const userInfo = {
      name: userName,
      dateOfBirth: '2002-08-17', // Default - you'd get this from user profile
      timeOfBirth: '16:30',
      placeOfBirth: 'Gaya, India',
      email: '',
      phone: fromNumber
    }

    // Get birth chart data
    const birthChart = await getBirthChart({
      name: userInfo.name,
      dateOfBirth: userInfo.dateOfBirth,
      timeOfBirth: userInfo.timeOfBirth,
      placeOfBirth: userInfo.placeOfBirth,
    })

    // Parse date and time for API
    const [year, month, day] = userInfo.dateOfBirth.split('-').map(Number)
    const [hour, min] = userInfo.timeOfBirth.split(':').map(Number)

    // Call astrology chat API
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
      lat: "19.17",
      lon: "73.7",
      tzone: "5.5",
      gender: "male",
      country: "INDIA",
      ap: "KUNDLI",
      sid: "astro-6",
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
      console.error('[WhatsApp] Astrology API error:', errorText)
      
      // Send error message back to WhatsApp
      return NextResponse.json({
        messaging_product: "whatsapp",
        to: body?.From || 'unknown',
        type: "text",
        text: "Sorry, I'm having trouble connecting to the astrology service right now. Please try again later."
      })
    }

    const data = await response.json()
    console.log('[WhatsApp] Astrology API response:', data)

    if (data.success && data.response) {
      // Send response back to WhatsApp
      return NextResponse.json({
        messaging_product: "whatsapp",
        to: body?.From || 'unknown',
        type: "text",
        text: data.response
      })
    } else {
      return NextResponse.json({
        messaging_product: "whatsapp",
        to: body?.From || 'unknown',
        type: "text",
        text: "I apologize, but I couldn't process your request. Please try again."
      })
    }

  } catch (error) {
    console.error('[WhatsApp] API error:', error)
    
    return NextResponse.json({
      messaging_product: "whatsapp",
      to: body?.From || 'unknown',
      type: "text",
      text: "An error occurred. Please try again later."
    })
  }
}

// WhatsApp verification endpoint
export async function GET(request: NextRequest) {
  const webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

  if (!webhookVerifyToken) {
    return NextResponse.json({ error: 'Webhook verification token not configured' }, { status: 500 })
  }

  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === webhookVerifyToken) {
    return new NextResponse(challenge, { status: 200 })
  } else {
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
  }
}
