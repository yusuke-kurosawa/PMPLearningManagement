import { http, HttpResponse } from 'msw'

export const handlers = [
  // GeoIP API mocks
  http.get('http://ip-api.com/json/:ip', ({ params }) => {
    const { ip } = params
    if (ip === '203.0.113.1') {
      return HttpResponse.json({
        status: 'success',
        country: 'Japan',
        countryCode: 'JP',
        region: '13',
        regionName: 'Tokyo',
        city: 'Tokyo',
        lat: 35.6895,
        lon: 139.6917,
        timezone: 'Asia/Tokyo',
        isp: 'Example ISP',
        org: 'Example Org',
        proxy: false,
        hosting: false,
      })
    }
    if (ip === '8.8.8.8') {
      return HttpResponse.json({ status: 'fail', message: 'API failed' })
    }
    if (ip === '0.0.0.0') {
      return HttpResponse.json({ status: 'fail', message: 'Invalid IP' })
    }
    // Default response for other IPs
    return HttpResponse.json({
      status: 'success',
      country: 'Unknown',
      countryCode: 'XX',
      region: 'Unknown',
      regionName: 'Unknown',
      city: 'Unknown',
      lat: 0,
      lon: 0,
      timezone: 'UTC',
      isp: 'Unknown ISP',
      org: 'Unknown Org',
      proxy: false,
      hosting: false,
    })
  }),

  http.get('https://api.ipgeolocation.io/ipgeo', ({ request }) => {
    const url = new URL(request.url)
    const ip = url.searchParams.get('ip')
    
    if (ip === '203.0.113.1') {
      return HttpResponse.json({
        ip: '203.0.113.1',
        country_name: 'Japan',
        country_code2: 'JP',
        state_prov: 'Tokyo',
        city: 'Tokyo',
        latitude: '35.6895',
        longitude: '139.6917',
        time_zone: {
          name: 'Asia/Tokyo'
        },
        isp: 'Example ISP',
        organization: 'Example Org',
        security: {
          threat_score: 10
        }
      })
    }
    
    if (ip === '8.8.8.8') {
      return HttpResponse.json({
        ip: '8.8.8.8',
        country_name: 'United States',
        country_code2: 'US',
        state_prov: 'California',
        city: 'San Francisco',
        latitude: '37.7749',
        longitude: '-122.4194',
        time_zone: {
          name: 'America/Los_Angeles'
        },
        isp: 'Example ISP',
        organization: 'Example Org',
        security: {
          is_proxy: false,
          is_vpn: true,
          is_tor: false,
          is_hosting: false,
          threat_score: 0
        }
      })
    }
    
    return HttpResponse.json({
      ip: ip || 'unknown',
      country_name: 'Test Country',
      country_code2: 'TC',
      state_prov: 'Test State',
      city: 'Test City',
      latitude: '0',
      longitude: '0',
      time_zone: {
        name: 'UTC'
      },
      isp: 'Test ISP',
      organization: 'Test Org',
      security: {
        threat_score: 0
      }
    })
  }),

  http.get('https://geoip.maxmind.com/geoip/v2.1/insights/:ip', ({ params }) => {
    const { ip } = params
    return HttpResponse.json({
      country: {
        iso_code: 'JP',
        names: { en: 'Japan' }
      },
      subdivisions: [{
        iso_code: '13',
        names: { en: 'Tokyo' }
      }],
      city: {
        names: { en: 'Tokyo' }
      },
      location: {
        latitude: 35.6895,
        longitude: 139.6917,
        time_zone: 'Asia/Tokyo'
      },
      traits: {
        ip_address: ip
      }
    })
  }),
  // Internal API endpoints
  http.get('/api/progress', () => {
    return HttpResponse.json({
      totalProcesses: 49,
      completedProcesses: 12,
      knowledgeAreaProgress: {
        'Integration Management': { completed: 3, total: 7 },
        'Scope Management': { completed: 2, total: 6 },
        'Schedule Management': { completed: 1, total: 6 },
        'Cost Management': { completed: 2, total: 4 },
        'Quality Management': { completed: 1, total: 3 },
        'Resource Management': { completed: 1, total: 6 },
        'Communications Management': { completed: 1, total: 3 },
        'Risk Management': { completed: 1, total: 7 },
        'Procurement Management': { completed: 0, total: 3 },
        'Stakeholder Management': { completed: 0, total: 4 },
      },
      processGroupProgress: {
        Initiating: { completed: 2, total: 2 },
        Planning: { completed: 6, total: 24 },
        Executing: { completed: 2, total: 10 },
        'Monitoring and Controlling': { completed: 2, total: 12 },
        Closing: { completed: 0, total: 1 },
      },
      studyTime: 1200, // in minutes
      lastStudyDate: '2025-08-08T10:30:00Z',
    })
  }),

  http.post('/api/progress/:processId', () => {
    return HttpResponse.json({ success: true })
  }),

  http.get('/api/exam/questions', () => {
    return HttpResponse.json([
      {
        id: 1,
        question: 'Which of the following is NOT one of the five process groups in PMBOK?',
        options: ['Initiating', 'Planning', 'Testing', 'Executing'],
        correct: 2,
        knowledgeArea: 'Integration Management',
        processGroup: 'General',
        explanation:
          'Testing is not one of the five process groups. The five process groups are: Initiating, Planning, Executing, Monitoring and Controlling, and Closing.',
      },
    ])
  }),

  // Mock localStorage for browser environment
  http.get('/api/storage/:key', ({ params }) => {
    const { key } = params
    const value = localStorage.getItem(key)
    return HttpResponse.json({ value })
  }),

  http.post('/api/storage/:key', async ({ params, request }) => {
    const { key } = params
    const { value } = await request.json()
    localStorage.setItem(key, JSON.stringify(value))
    return HttpResponse.json({ success: true })
  }),
]
