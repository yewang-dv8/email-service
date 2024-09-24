import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

function setCorsHeaders(origin: string) {
  const allowedOrigins = ['http://localhost:5173', process.env.PRODUCTION_SITE]

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

export async function POST(request: Request) {
  const origin = request.headers.get('origin') || ''
  const corsHeaders = setCorsHeaders(origin)
  try {
    const client = await clientPromise
    const db = client.db()
    const body = await request.json()

    if (!body.title || !body.responses || body.responses.length === 0) {
      return NextResponse.json(
        { error: 'Survey title and responses are required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Check if a cookie exists
    const cookieHeader = request.headers.get('cookie')
    const cookies = new Map<string, string>()
    if (cookieHeader) {
      cookieHeader.split(';').forEach((cookie) => {
        const [key, value] = cookie.trim().split('=')
        if (key && value) {
          cookies.set(key, value)
        }
      })
    }

    if (cookies.get('survey_submitted') === 'true') {
      return NextResponse.json(
        { error: 'You have already submitted this survey.' },
        { status: 400, headers: corsHeaders }
      )
    }

    const surveyResponse = {
      title: body.title,
      responses: body.responses,
      form_id: body.form_id,
      submitted_date: new Date(),
    }

    const result = await db
      .collection('surveyResponses')
      .insertOne(surveyResponse)

    // Set a cookie to indicate successful submission
    const response = NextResponse.json(
      {
        message: 'Survey submitted successfully',
        insertedId: result.insertedId,
      },
      { status: 201, headers: corsHeaders }
    )
    response.cookies.set('survey_submitted', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response

    // return NextResponse.json(
    //   {
    //     message: 'Survey submitted successfully',
    //     insertedId: result.insertedId,
    //   },
    //   { status: 201, headers: corsHeaders }
    // )
  } catch (e) {
    console.error('Error submitting survey:', e)
    return NextResponse.json(
      { error: 'Failed to submit survey' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// Handle OPTIONS request to support preflight CORS checks
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || ''
  const corsHeaders = setCorsHeaders(origin)
  return NextResponse.json({}, { headers: corsHeaders })
}
