import { NextRequest, NextResponse } from 'next/server'
import { getBirthChart } from '@/lib/astrology'

// In-memory user storage (in production, use a database)
const userProfiles = new Map()
const onboardingStates = new Map()

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

function getOnboardingForm() {
  return `🌟 Welcome to Cosmic AI - Your Personal Astrologer! 🌟

I'm here to provide you with personalized Vedic astrology insights. To get started, please provide:

1️⃣ Your Full Name
2️⃣ Date of Birth (DD/MM/YYYY)
3️⃣ Time of Birth (HH:MM, 24-hour format)
4️⃣ Place of Birth (City, Country)

You can send all details in one message like:
"John Doe, 17/08/2002, 16:30, Gaya, India"

Or send them one by one. Let's begin your cosmic journey! ✨`
}

function parseOnboardingDetails(message: string) {
  // Try different formats
  const patterns = [
    /(.+?),\s*(\d{1,2}\/\d{1,2}\/\d{4}),\s*(\d{1,2}:\d{2}),\s*(.+)$/, // "Name, DD/MM/YYYY, HH:MM, Place"
    /(.+?)\s+(\d{1,2}\/\d{1,2}\/\d{4})\s+(\d{1,2}:\d{2})\s+(.+)$/, // "Name DD/MM/YYYY HH:MM Place"
  ]

  for (const pattern of patterns) {
    const match = message.match(pattern)
    if (match) {
      const [, name, dob, time, place] = match
      return {
        name: name.trim(),
        dateOfBirth: dob,
        timeOfBirth: time,
        placeOfBirth: place.trim()
      }
    }
  }

  return null
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

    // Check if user is onboarded
    const userProfile = userProfiles.get(fromNumber)
    const onboardingState = onboardingStates.get(fromNumber)

    // If user is not onboarded, start onboarding
    if (!userProfile) {
      if (!onboardingState) {
        // First time user - send onboarding form
        onboardingStates.set(fromNumber, { step: 'started' })
        await sendWhatsAppMessage(fromNumber, getOnboardingForm())
        return NextResponse.json({ status: 'ok' }, { status: 200 })
      }

      // Try to parse onboarding details
      const details = parseOnboardingDetails(message)
      
      if (details) {
        // Convert date format from DD/MM/YYYY to YYYY-MM-DD
        const [day, month, year] = details.dateOfBirth.split('/')
        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

        // Save user profile
        const userProfile = {
          ...details,
          dateOfBirth: formattedDate,
          phone: fromNumber,
          createdAt: new Date()
        }
        
        userProfiles.set(fromNumber, userProfile)
        onboardingStates.delete(fromNumber)

        // Generate initial reading
        try {
          const birthChart = await getBirthChart({
            name: userProfile.name,
            dateOfBirth: userProfile.dateOfBirth,
            timeOfBirth: userProfile.timeOfBirth,
            placeOfBirth: userProfile.placeOfBirth,
          })

          const welcomeMessage = `🎉 Thank you ${userProfile.name}! Your cosmic profile is ready.

🌟 Your Zodiac Sign: ${birthChart.sun?.sign || 'Unknown'}
🌙 Your Moon Sign: ${birthChart.moon?.sign || 'Unknown'}
⭐ Your Ascendant: ${birthChart.ascendant?.sign || 'Unknown'}

I'm now ready to answer your questions! Ask me about:
• Career guidance
• Love compatibility  
• Daily predictions
• Lucky colors
• Any astrology questions!

What would you like to know? ✨`

          await sendWhatsAppMessage(fromNumber, welcomeMessage)
          return NextResponse.json({ status: 'ok' }, { status: 200 })

        } catch (error) {
          console.error('Error generating birth chart:', error)
          await sendWhatsAppMessage(fromNumber, "I had trouble creating your birth chart. Please check your details and try again.")
          return NextResponse.json({ status: 'ok' }, { status: 200 })
        }
      } else {
        // Couldn't parse details, ask for clarification
        await sendWhatsAppMessage(fromNumber, 
          "I couldn't understand that format. Please send your details in this format:\n\n" +
          "\"John Doe, 17/08/2002, 16:30, Gaya, India\"\n\n" +
          "Or send them one by one. Let me know what you need help with!"
        )
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
