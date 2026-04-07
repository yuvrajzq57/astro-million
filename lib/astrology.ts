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

    // Use the planetary positions API to get zodiac signs
    const requestData = {
      language: "en",
      name: params.name,
      day: day,
      month: month,
      year: year,
      hour: hour,
      min: min,
      place: params.placeOfBirth,
      lat: (params.latitude || 19.17).toString(),
      lon: (params.longitude || 73.7).toString(),
      tzone: "5.5",
      gender: "male",
      country: "INDIA",
      ap: "KUNDLI",
      sid: "astro-6",
      ep: "STANDARD",
      ac: "VEDIC"
    }

    console.log('[v0] API Request:', {
      url: 'https://json.astrologyapi.com/v1/planetary_positions',
      headers: {
        'Content-Type': 'application/json',
        'x-astrologyapi-key': apiKey,
      },
      body: requestData
    })

    const response = await fetch(
      'https://json.astrologyapi.com/v1/planetary_positions',
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

    // Parse the response from planetary positions API
    // The response should contain planetary data with zodiac signs
    let sunSign = 'Unknown'
    let moonSign = 'Unknown'
    let ascendantSign = 'Unknown'

    // Try to extract zodiac signs from the response
    if (data && data.seasons) {
      // Check if seasons contains zodiac data
      sunSign = data.seasons.sun_sign || 'Unknown'
      moonSign = data.seasons.moon_sign || 'Unknown'
      ascendantSign = data.seasons.ascendant_sign || 'Unknown'
    }

    if (data && data.sun) {
      sunSign = data.sun.sign || data.sun_name || 'Unknown'
    }

    if (data && data.moon) {
      moonSign = data.moon.sign || data.moon_name || 'Unknown'
    }

    if (data && data.ascendant) {
      ascendantSign = data.ascendant.sign || data.ascendant_name || 'Unknown'
    }

    // If still unknown, try other possible field names
    if (sunSign === 'Unknown' && data) {
      sunSign = data.sun_sign || data.sunName || data.Sun || 'Unknown'
    }
    if (moonSign === 'Unknown' && data) {
      moonSign = data.moon_sign || data.moonName || data.Moon || 'Unknown'
    }
    if (ascendantSign === 'Unknown' && data) {
      ascendantSign = data.ascendant_sign || data.ascendantName || data.Ascendant || 'Unknown'
    }

    console.log('[v0] Extracted signs:', { sunSign, moonSign, ascendantSign })

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
