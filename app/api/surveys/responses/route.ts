import clientPromise from '@/lib/mongodb'
import { NextResponse } from 'next/server'

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

// Get user responses
export async function GET(request: Request) {
  const origin = request.headers.get('origin') || ''
  const corsHeaders = setCorsHeaders(origin)

  try {
    const client = await clientPromise
    const db = client.db()

    const url = new URL(request.url)
    const formId = url.searchParams.get('form_id')

    let query = {}
    if (formId) {
      query = { form_id: formId }
    }
    const surveyResponses = await db
      .collection('surveyResponses')
      .find(query)
      .toArray()

    return NextResponse.json(surveyResponses, { headers: corsHeaders })
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to fetch surveys' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// OPTIONS Handler (For CORS preflight requests)
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || ''
  const corsHeaders = setCorsHeaders(origin)
  return NextResponse.json({}, { headers: corsHeaders })
}
