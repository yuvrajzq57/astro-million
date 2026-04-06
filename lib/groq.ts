import { BirthChart } from './astrology'

export interface Reading {
  overview: string
  luckyColour: string
  focus: string
  avoid: string
}

export async function generateVedicReading(
  birthChart: BirthChart
): Promise<Reading> {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set')
  }

  const prompt = `You are an expert Vedic astrologer. Based on the following birth chart information, provide a personalized Vedic astrology reading.

Birth Chart Details:
- Name: ${birthChart.name}
- Date of Birth: ${birthChart.dateOfBirth}
- Time of Birth: ${birthChart.timeOfBirth}
- Place of Birth: ${birthChart.placeOfBirth}
- Sun Sign: ${birthChart.sun.sign} (${birthChart.sun.degree}°)
- Moon Sign: ${birthChart.moon.sign} (${birthChart.moon.degree}°)
- Ascendant: ${birthChart.ascendant.sign} (${birthChart.ascendant.degree}°)

Please provide a response in the following JSON format (and ONLY this format, no other text):
{
  "overview": "A 2-3 sentence overview of the person's Vedic astrological profile and personality traits based on their birth chart",
  "luckyColour": "A single color that is auspicious for this person",
  "focus": "One area of life or practice they should focus on for success and harmony",
  "avoid": "One thing or situation they should be cautious about or avoid"
}

Ensure the response is valid JSON only.`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('[v0] Groq API error response:', errorData)
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ''

    // Extract JSON from the response, handling potential markdown code blocks
    let jsonContent = content
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/)
    if (jsonMatch) {
      jsonContent = jsonMatch[1]
    }

    const reading = JSON.parse(jsonContent)

    return {
      overview: reading.overview || 'Your birth chart reveals a unique cosmic influence.',
      luckyColour:
        reading.luckyColour || reading.lucky_colour || 'Purple',
      focus: reading.focus || 'Personal growth and spiritual development',
      avoid: reading.avoid || 'Hasty decisions without proper reflection',
    }
  } catch (error) {
    console.error('Failed to generate reading:', error)
    // Return mock reading for development
    return getMockReading()
  }
}

function getMockReading(): Reading {
  return {
    overview:
      'Your birth chart reveals a unique cosmic influence blending introspective lunar energy with dynamic solar expression. You are naturally intuitive and possess a strong drive for personal growth and transformation.',
    luckyColour: 'Purple',
    focus: 'Spiritual development and meditation practice',
    avoid: 'Overcommitting to too many projects at once',
  }
}
