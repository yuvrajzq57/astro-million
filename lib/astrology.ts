interface BirthChartParams {
  name: string
  dateOfBirth: string // YYYY-MM-DD
  timeOfBirth: string // HH:MM
  placeOfBirth: string
  latitude?: number
  longitude?: number
}

export interface BirthChart {
  name: string
  dateOfBirth: string
  timeOfBirth: string
  placeOfBirth: string
  sun: {
    sign: string
    degree: number
  }
  moon: {
    sign: string
    degree: number
  }
  ascendant: {
    sign: string
    degree: number
  }
  houses: Array<{
    number: number
    sign: string
    degree: number
  }>
}

export async function getBirthChart(
  params: BirthChartParams
): Promise<BirthChart> {
  const apiKey = process.env.ASTROLOGY_API_KEY

  if (!apiKey) {
    throw new Error('ASTROLOGY_API_KEY environment variable is not set')
  }

  try {
    // Parse date and time
    const [year, month, day] = params.dateOfBirth.split('-').map(Number)
    const [hour, min] = params.timeOfBirth.split(':').map(Number)

    console.log('[v0] Calling Astrology API with:', { day, month, year, hour, min, place: params.placeOfBirth })

    // Use the chat API to get zodiac signs and birth chart information
    // Get coordinates for the birth place (simplified approach)
    let latitude = 19.17 // Default for India
    let longitude = 73.7  // Default for India
    
    // Common Indian city coordinates
    const cityCoordinates: { [key: string]: { lat: number; lon: number } } = {
      'gaya': { lat: 24.79, lon: 84.98 },
      'saharsa': { lat: 25.88, lon: 86.60 },
      'patna': { lat: 25.59, lon: 85.14 },
      'delhi': { lat: 28.70, lon: 77.10 },
      'mumbai': { lat: 19.07, lon: 72.87 },
      'bangalore': { lat: 12.97, lon: 77.59 },
      'kolkata': { lat: 22.57, lon: 88.36 },
      'chennai': { lat: 13.08, lon: 80.27 },
      'hyderabad': { lat: 17.38, lon: 78.48 },
      'pune': { lat: 18.52, lon: 73.86 },
    }
    
    // Extract city name from place
    const placeLower = params.placeOfBirth.toLowerCase()
    const cityName = placeLower.split(',')[0].trim()
    
    if (cityCoordinates[cityName]) {
      latitude = cityCoordinates[cityName].lat
      longitude = cityCoordinates[cityName].lon
      console.log('[v0] Using coordinates for', cityName, ':', { latitude, longitude })
    } else {
      console.log('[v0] Using default coordinates for unknown city:', cityName)
    }

    const requestData = {
      language: "en",
      name: params.name,
      day: day,
      month: month,
      year: year,
      hour: hour,
      min: min,
      place: params.placeOfBirth,
      lat: latitude.toString(),
      lon: longitude.toString(),
      tzone: "5.5",
      gender: "male",
      country: "INDIA",
      ap: "KUNDLI",
      sid: "astro-6",
      ep: "STANDARD",
      ac: "VEDIC",
      q: "What is my zodiac sign, moon sign, and ascendant? Please provide the three main signs in a simple format."
    }

    console.log('[v0] API Request:', {
      url: 'https://json-chat.astrologyapi.com/api/chat',
      headers: {
        'Content-Type': 'application/json',
        'x-astrologyapi-key': apiKey,
      },
      body: requestData
    })

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
      console.error('[v0] Astrology API error response:', errorText)
      throw new Error(`Astrology API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('[v0] Astrology API response:', data)

    // Parse the response from chat API to extract zodiac signs
    let sunSign = 'Unknown'
    let moonSign = 'Unknown'
    let ascendantSign = 'Unknown'

    if (data && data.response) {
      const responseText = data.response.toLowerCase()
      
      console.log('[v0] Parsing response text:', responseText)
      
      // Extract zodiac signs from the structured response
      // The API returns: "**Zodiac Sign (Sun Sign):** Sagittarius"
      
      // Extract sun sign (zodiac sign)
      const sunSignMatch = responseText.match(/\*\*zodiac sign.*?\*\*:\s*([a-z]+)/i)
      if (sunSignMatch) {
        sunSign = sunSignMatch[1].charAt(0).toUpperCase() + sunSignMatch[1].slice(1)
      }
      
      // Extract moon sign
      const moonSignMatch = responseText.match(/\*\*moon sign\*\*:\s*([a-z]+)/i)
      if (moonSignMatch) {
        moonSign = moonSignMatch[1].charAt(0).toUpperCase() + moonSignMatch[1].slice(1)
      }
      
      // Extract ascendant sign
      const ascendantMatch = responseText.match(/\*\*ascendant.*?\*\*:\s*([a-z]+)/i)
      if (ascendantMatch) {
        ascendantSign = ascendantMatch[1].charAt(0).toUpperCase() + ascendantMatch[1].slice(1)
      }
      
      // If still not found, try simpler patterns
      if (sunSign === 'Unknown') {
        const lines = responseText.split('\n')
        for (const line of lines) {
          if (line.includes('zodiac sign') || line.includes('sun sign')) {
            const match = line.match(/([a-z]+)\s*$/)
            if (match) {
              sunSign = match[1].charAt(0).toUpperCase() + match[1].slice(1)
              break
            }
          }
        }
      }
      
      if (moonSign === 'Unknown') {
        const lines = responseText.split('\n')
        for (const line of lines) {
          if (line.includes('moon sign')) {
            const match = line.match(/([a-z]+)\s*$/)
            if (match) {
              moonSign = match[1].charAt(0).toUpperCase() + match[1].slice(1)
              break
            }
          }
        }
      }
      
      if (ascendantSign === 'Unknown') {
        const lines = responseText.split('\n')
        for (const line of lines) {
          if (line.includes('ascendant') || line.includes('rising')) {
            const match = line.match(/([a-z]+)\s*$/)
            if (match) {
              ascendantSign = match[1].charAt(0).toUpperCase() + match[1].slice(1)
              break
            }
          }
        }
      }

      // Validate zodiac sign based on birth date as fallback
      const expectedSunSign = getZodiacSign(day, month)
      console.log('[v0] Expected sun sign based on date:', expectedSunSign)
      
      // If API returns wrong sun sign, use calculated one
      if (sunSign !== expectedSunSign) {
        console.log('[v0] API sun sign incorrect, using calculated:', expectedSunSign)
        sunSign = expectedSunSign
      }

      console.log('[v0] Extracted signs from chat:', { sunSign, moonSign, ascendantSign })
    }

    function getZodiacSign(day: number, month: number): string {
      const zodiacSigns = [
        { name: "Capricorn", start: [12, 22], end: [1, 19] },
        { name: "Aquarius", start: [1, 20], end: [2, 18] },
        { name: "Pisces", start: [2, 19], end: [3, 20] },
        { name: "Aries", start: [3, 21], end: [4, 19] },
        { name: "Taurus", start: [4, 20], end: [5, 20] },
        { name: "Gemini", start: [5, 21], end: [6, 20] },
        { name: "Cancer", start: [6, 21], end: [7, 22] },
        { name: "Leo", start: [7, 23], end: [8, 22] },
        { name: "Virgo", start: [8, 23], end: [9, 22] },
        { name: "Libra", start: [9, 23], end: [10, 22] },
        { name: "Scorpio", start: [10, 23], end: [11, 21] },
        { name: "Sagittarius", start: [11, 22], end: [12, 21] }
      ]

      for (const sign of zodiacSigns) {
        const [startMonth, startDay] = sign.start
        const [endMonth, endDay] = sign.end
        
        if (startMonth === endMonth) {
          if (month === startMonth && day >= startDay && day <= endDay) {
            return sign.name
          }
        } else {
          if ((month === startMonth && day >= startDay) || 
              (month === endMonth && day <= endDay)) {
            return sign.name
          }
        }
      }
      
      return "Unknown"
    }

    return {
      name: params.name,
      dateOfBirth: params.dateOfBirth,
      timeOfBirth: params.timeOfBirth,
      placeOfBirth: params.placeOfBirth,
      sun: {
        sign: sunSign,
        degree: 0,
      },
      moon: {
        sign: moonSign,
        degree: 0,
      },
      ascendant: {
        sign: ascendantSign,
        degree: 0,
      },
      houses: [],
    }
  } catch (error) {
    console.error('[v0] Failed to fetch birth chart:', error)
    
    // Instead of returning mock data, throw a proper error
    // so the calling function can handle it appropriately
    throw new Error(`Unable to generate birth chart: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
