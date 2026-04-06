import { NextRequest, NextResponse } from 'next/server'
import { getBirthChart } from '@/lib/astrology'
import { generateVedicReading } from '@/lib/groq'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { name, dateOfBirth, timeOfBirth, placeOfBirth, email, phone } =
      body

    // Validate required fields
    if (
      !name ||
      !dateOfBirth ||
      !timeOfBirth ||
      !placeOfBirth ||
      !email
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('[v0] Generating reading for:', {
      name,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
    })

    // Get birth chart
    console.log('[v0] Fetching birth chart...')
    const birthChart = await getBirthChart({
      name,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
    })

    console.log('[v0] Birth chart generated:', {
      sun: birthChart.sun.sign,
      moon: birthChart.moon.sign,
      ascendant: birthChart.ascendant.sign,
    })

    // Generate Vedic reading
    console.log('[v0] Generating Vedic reading with Groq API...')
    const reading = await generateVedicReading(birthChart)

    console.log('[v0] Reading generated successfully:', reading)

    return NextResponse.json(
      {
        success: true,
        birthChart,
        reading,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] API Error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate reading',
      },
      { status: 500 }
    )
  }
}
