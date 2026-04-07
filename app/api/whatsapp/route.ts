import { NextRequest, NextResponse } from 'next/server'
import { getBirthChart } from '@/lib/astrology'

// In-memory user storage (in production, use a database)
const userProfiles = new Map()
const onboardingStates = new Map()

interface OnboardingData {
  step: 'name' | 'dob' | 'time' | 'place' | 'completed'
  data: {
    name?: string
    dateOfBirth?: string
    timeOfBirth?: string
    placeOfBirth?: string
  }
}

async function sendWhatsAppMessage(to: string, message: string) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  console.log('[WhatsApp] Sending message to:', to)
  console.log('[WhatsApp] Access Token exists:', !!accessToken)
  console.log('[WhatsApp] Phone ID exists:', !!phoneNumberId)

  if (!accessToken || !phoneNumberId) {
    console.error('WhatsApp credentials not configured')
    console.error('WHATSAPP_ACCESS_TOKEN:', accessToken ? 'SET' : 'NOT SET')
    console.error('WHATSAPP_PHONE_NUMBER_ID:', phoneNumberId ? 'SET' : 'NOT SET')
    return null
  }

  try {
    const payload = {
      messaging_product: "whatsapp",
      to: to.replace('whatsapp:', ''),
      type: "text",
      text: { body: message }
    }
    
    console.log('[WhatsApp] API payload:', JSON.stringify(payload, null, 2))

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    const responseText = await response.text()
    console.log('[WhatsApp] API response status:', response.status)
    console.log('[WhatsApp] API response body:', responseText)

    if (!response.ok) {
      console.error('WhatsApp API error:', responseText)
      return null
    }

    return JSON.parse(responseText)
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return null
  }
}

function getOnboardingMessage(step: string, userName?: string): string {
  switch (step) {
    case 'name':
      return `Welcome to Cosmic AI! ${userName ? `Hi ${userName}!` : ''}

I'm your personal AI astrologer. Let's create your cosmic profile step by step.

First, what's your full name?`

    case 'dob':
      return `Great! Now, what's your date of birth?

Please reply in this format: DD/MM/YYYY
Example: 17/08/2002`

    case 'time':
      return `Perfect! What time were you born?

Please reply in 24-hour format: HH:MM
Example: 16:30 (for 4:30 PM)`

    case 'place':
      return `Almost done! Where were you born?

Please reply: City, Country
Example: Gaya, India`

    case 'completed':
      return `Thank you! I'm generating your cosmic profile now...`

    default:
      return getOnboardingMessage('name')
  }
}

function validateAndParseDate(dateStr: string): { valid: boolean; formatted?: string } {
  const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  const match = dateStr.match(dateRegex)
  
  if (!match) return { valid: false }
  
  const [, day, month, year] = match
  const dayNum = parseInt(day)
  const monthNum = parseInt(month)
  const yearNum = parseInt(year)
  
  if (dayNum < 1 || dayNum > 31) return { valid: false }
  if (monthNum < 1 || monthNum > 12) return { valid: false }
  if (yearNum < 1900 || yearNum > 2024) return { valid: false }
  
  return { 
    valid: true, 
    formatted: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` 
  }
}

function validateAndParseTime(timeStr: string): { valid: boolean; formatted?: string } {
  const timeRegex = /^(\d{1,2}):(\d{2})$/
  const match = timeStr.match(timeRegex)
  
  if (!match) return { valid: false }
  
  const [, hour, minute] = match
  const hourNum = parseInt(hour)
  const minuteNum = parseInt(minute)
  
  if (hourNum < 0 || hourNum > 23) return { valid: false }
  if (minuteNum < 0 || minuteNum > 59) return { valid: false }
  
  return { 
    valid: true, 
    formatted: `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}` 
  }
}

function validatePlace(placeStr: string): { valid: boolean; formatted?: string } {
  const parts = placeStr.split(',')
  if (parts.length < 2) return { valid: false }
  
  const city = parts[0].trim()
  const country = parts[parts.length - 1].trim()
  
  if (city.length < 2 || country.length < 2) return { valid: false }
  
  return { 
    valid: true, 
    formatted: `${city}, ${country}` 
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[WhatsApp] Full webhook payload:', JSON.stringify(body, null, 2))
    
    // Extract message from WhatsApp webhook structure
    let fromNumber = null
    let message = null
    let userName = 'User'

    if (body.entry && body.entry[0] && body.entry[0].changes) {
      const changes = body.entry[0].changes
      if (changes[0] && changes[0].value && changes[0].value.messages) {
        const messages = changes[0].value.messages
        if (messages && messages[0]) {
          const msg = messages[0]
          fromNumber = msg.from
          message = msg.text ? msg.text.body : null
          
          // Get user name if available
          if (changes[0].value.contacts && changes[0].value.contacts[0]) {
            userName = changes[0].value.contacts[0].profile_name || 'User'
          }
        }
      }
    }

    if (!message) {
      console.log('[WhatsApp] No message in payload, returning 200')
      return NextResponse.json({ status: 'ok' }, { status: 200 })
    }

    console.log('[WhatsApp] Message from', fromNumber, ':', message)
    console.log('[WhatsApp] User Name:', userName)

    // Check if user is onboarded
    const userProfile = userProfiles.get(fromNumber)
    const onboardingState = onboardingStates.get(fromNumber)
    
    console.log('[WhatsApp] User Profile exists:', !!userProfile)
    console.log('[WhatsApp] Onboarding State:', onboardingState)
    console.log('[WhatsApp] Current users in memory:', Array.from(userProfiles.keys()))

    // If user is not onboarded, start onboarding
    if (!userProfile) {
      const onboardingData: OnboardingData = onboardingStates.get(fromNumber) || { 
        step: 'name', 
        data: {} 
      }
      
      console.log('[WhatsApp] Onboarding step:', onboardingData.step)
      console.log('[WhatsApp] Onboarding data:', onboardingData.data)

      // Process based on current step
      switch (onboardingData.step) {
        case 'name':
          // Save name and move to next step
          onboardingData.data.name = message.trim()
          onboardingData.step = 'dob'
          onboardingStates.set(fromNumber, onboardingData)
          await sendWhatsAppMessage(fromNumber, getOnboardingMessage('dob'))
          return NextResponse.json({ status: 'ok' }, { status: 200 })

        case 'dob':
          // Validate and save date of birth
          const dateValidation = validateAndParseDate(message.trim())
          if (!dateValidation.valid) {
            await sendWhatsAppMessage(fromNumber, 
              `Invalid date format. Please use DD/MM/YYYY format.\n\n` + getOnboardingMessage('dob')
            )
            return NextResponse.json({ status: 'ok' }, { status: 200 })
          }
          onboardingData.data.dateOfBirth = dateValidation.formatted
          onboardingData.step = 'time'
          onboardingStates.set(fromNumber, onboardingData)
          await sendWhatsAppMessage(fromNumber, getOnboardingMessage('time'))
          return NextResponse.json({ status: 'ok' }, { status: 200 })

        case 'time':
          // Validate and save time of birth
          const timeValidation = validateAndParseTime(message.trim())
          if (!timeValidation.valid) {
            await sendWhatsAppMessage(fromNumber, 
              `Invalid time format. Please use HH:MM (24-hour) format.\n\n` + getOnboardingMessage('time')
            )
            return NextResponse.json({ status: 'ok' }, { status: 200 })
          }
          onboardingData.data.timeOfBirth = timeValidation.formatted
          onboardingData.step = 'place'
          onboardingStates.set(fromNumber, onboardingData)
          await sendWhatsAppMessage(fromNumber, getOnboardingMessage('place'))
          return NextResponse.json({ status: 'ok' }, { status: 200 })

        case 'place':
          // Validate and save place of birth
          const placeValidation = validatePlace(message.trim())
          if (!placeValidation.valid) {
            await sendWhatsAppMessage(fromNumber, 
              `Invalid place format. Please use "City, Country" format.\n\n` + getOnboardingMessage('place')
            )
            return NextResponse.json({ status: 'ok' }, { status: 200 })
          }
          onboardingData.data.placeOfBirth = placeValidation.formatted
          onboardingData.step = 'completed'
          
          // Send completion message
          await sendWhatsAppMessage(fromNumber, getOnboardingMessage('completed'))
          
          // Create user profile
          const newUserProfile = {
            ...onboardingData.data,
            phone: fromNumber,
            createdAt: new Date()
          }
          
          userProfiles.set(fromNumber, newUserProfile)
          onboardingStates.delete(fromNumber)

          // Generate initial reading
          try {
            console.log('[WhatsApp] Generating birth chart for:', newUserProfile)
            
            const birthChart = await getBirthChart({
              name: newUserProfile.name || 'User',
              dateOfBirth: newUserProfile.dateOfBirth || '2000-01-01',
              timeOfBirth: newUserProfile.timeOfBirth || '12:00',
              placeOfBirth: newUserProfile.placeOfBirth || 'Unknown',
            })

            console.log('[WhatsApp] Birth chart result:', birthChart)

            // Validate that we have real data (no "Unknown" signs)
            if (birthChart.sun.sign === 'Unknown' || birthChart.moon.sign === 'Unknown' || birthChart.ascendant.sign === 'Unknown') {
              throw new Error('Birth chart data is incomplete')
            }

            const welcomeMessage = `Thank you ${newUserProfile.name}! Your cosmic profile is ready.

Your Zodiac Sign: ${birthChart.sun.sign}
Your Moon Sign: ${birthChart.moon.sign}
Your Ascendant: ${birthChart.ascendant.sign}

I'm now ready to answer your questions! Ask me about:
Career guidance
Love compatibility  
Daily predictions
Lucky colors
Any astrology questions!

What would you like to know?`

            await sendWhatsAppMessage(fromNumber, welcomeMessage)
            return NextResponse.json({ status: 'ok' }, { status: 200 })

          } catch (error) {
            console.error('Error generating birth chart:', error)
            await sendWhatsAppMessage(fromNumber, 
              `I'm having trouble generating your birth chart right now. This could be due to:

1. Invalid birth details provided
2. API service temporarily unavailable
3. Location coordinates not found

Please try again in a few minutes, or double-check your birth details. If the issue persists, contact support.

Your details:
Name: ${newUserProfile.name}
DOB: ${newUserProfile.dateOfBirth}
Time: ${newUserProfile.timeOfBirth}
Place: ${newUserProfile.placeOfBirth}`
            )
            return NextResponse.json({ status: 'ok' }, { status: 200 })
          }

        default:
          // Start fresh onboarding
          onboardingStates.set(fromNumber, { step: 'name', data: {} })
          await sendWhatsAppMessage(fromNumber, getOnboardingMessage('name', userName))
          return NextResponse.json({ status: 'ok' }, { status: 200 })
      }
    }

    // User is onboarded - process their question
    if (userProfile) {
      try {
        // Get birth chart data
        const birthChart = await getBirthChart({
          name: userProfile.name,
          dateOfBirth: userProfile.dateOfBirth,
          timeOfBirth: userProfile.timeOfBirth,
          placeOfBirth: userProfile.placeOfBirth,
        })

        // Parse date and time for API
        const [year, month, day] = userProfile.dateOfBirth.split('-').map(Number)
        const [hour, min] = userProfile.timeOfBirth.split(':').map(Number)

        // Call astrology chat API
        const apiKey = process.env.ASTROLOGY_API_KEY

        if (!apiKey) {
          throw new Error('ASTROLOGY_API_KEY environment variable is not set')
        }

        const requestData = {
          language: "en",
          name: userProfile.name,
          day: day,
          month: month,
          year: year,
          hour: hour,
          min: min,
          place: userProfile.placeOfBirth,
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
          await sendWhatsAppMessage(fromNumber, 
            "Sorry, I'm having trouble connecting to the astrology service right now. Please try again later."
          )
          return NextResponse.json({ status: 'ok' }, { status: 200 })
        }

        const data = await response.json()
        console.log('[WhatsApp] Astrology API response:', data)

        if (data.success && data.response) {
          await sendWhatsAppMessage(fromNumber, data.response)
          return NextResponse.json({ status: 'ok' }, { status: 200 })
        } else {
          await sendWhatsAppMessage(fromNumber, 
            "I apologize, but I couldn't process your request. Please try again."
          )
          return NextResponse.json({ status: 'ok' }, { status: 200 })
        }

      } catch (error) {
        console.error('[WhatsApp] API error:', error)
        await sendWhatsAppMessage(fromNumber, 
          "An error occurred. Please try again later."
        )
        return NextResponse.json({ status: 'ok' }, { status: 200 })
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 })

  } catch (error) {
    console.error('[WhatsApp] Webhook error:', error)
    return NextResponse.json({ status: 'ok' }, { status: 200 })
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
