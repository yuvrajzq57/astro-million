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

    // Use birth details API endpoint to get actual zodiac signs
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
      url: 'https://json.astrologyapi.com/v1/birth_details',
      headers: {
        'Content-Type': 'application/json',
        'x-astrologyapi-key': apiKey,
      },
      body: requestData
    })

    const response = await fetch(
      'https://json.astrologyapi.com/v1/birth_details',
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

    // Parse the response from birth_details API
    return {
      name: params.name,
      dateOfBirth: params.dateOfBirth,
      timeOfBirth: params.timeOfBirth,
      placeOfBirth: params.placeOfBirth,
      sun: {
        sign: data.sun_sign || data.sun?.sign || 'Unknown',
        degree: data.sun_degree || data.sun?.degree || 0,
      },
      moon: {
        sign: data.moon_sign || data.moon?.sign || 'Unknown',
        degree: data.moon_degree || data.moon?.degree || 0,
      },
      ascendant: {
        sign: data.ascendant_sign || data.ascendant?.sign || 'Unknown',
        degree: data.ascendant_degree || data.ascendant?.degree || 0,
      },
      houses: data.houses || [],
    }
  } catch (error) {
    console.error('[v0] Failed to fetch birth chart:', error)
    
    // Instead of returning mock data, throw a proper error
    // so the calling function can handle it appropriately
    throw new Error(`Unable to generate birth chart: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
