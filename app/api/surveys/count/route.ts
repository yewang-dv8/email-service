import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

function setCorsHeaders(origin: string) {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://www.dv8energy.com',
    'https://email-service-lemon.vercel.app',
  ]

  const headers = new Headers()

  if (allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin)
  } else {
    headers.set('Access-Control-Allow-Origin', 'null')
  }

  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
  headers.set('Access-Control-Allow-Credentials', 'true')

  return headers
}

// 📌 Handle GET Request
export async function GET(request: Request) {
  const origin = request.headers.get('origin') || ''
  const corsHeaders = setCorsHeaders(origin)

  try {
    const client = await clientPromise
    const db = client.db()

    const url = new URL(request.url)
    const formId = url.searchParams.get('form_id')

    if (!formId) {
      return NextResponse.json(
        { error: 'Missing form_id' },
        { status: 400, headers: corsHeaders }
      )
    }

    const count = await db.collection('surveyResponses').countDocuments({
      form_id: formId,
    })

    return NextResponse.json({ count }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error counting survey submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// 📌 Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || ''
  const corsHeaders = setCorsHeaders(origin)

  return NextResponse.json({}, { headers: corsHeaders })
}
