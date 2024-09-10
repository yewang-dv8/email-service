import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { Survey } from '@/lib/survey.types'
import { ObjectId } from 'mongodb'

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

// GET
export async function GET(request: Request) {
  const origin = request.headers.get('origin') || ''
  const corsHeaders = setCorsHeaders(origin)
  try {
    const client = await clientPromise
    const db = client.db()

    const url = new URL(request.url)
    const surveyId = url.searchParams.get('id')

    if (surveyId) {
      // Get survey by ID
      const survey = await db
        .collection('surveys')
        .findOne({ _id: new ObjectId(surveyId) })

      if (!survey) {
        return NextResponse.json(
          { error: 'Survey not found' },
          { status: 404, headers: corsHeaders }
        )
      }

      const typedSurvey: Survey = {
        _id: survey._id as ObjectId,
        title: survey.title,
        created_date: survey.created_date,
        questions: survey.questions,
      }

      return NextResponse.json(typedSurvey, { headers: corsHeaders })
    } else {
      // Get all surveys
      const surveys = await db.collection('surveys').find({}).toArray()

      const typedSurveys: Survey[] = surveys.map((survey) => ({
        _id: survey._id as ObjectId,
        title: survey.title,
        created_date: survey.created_date,
        questions: survey.questions,
      }))

      return NextResponse.json(typedSurveys, { headers: corsHeaders })
    }
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to fetch surveys' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// POST
export async function POST(request: Request) {
  const origin = request.headers.get('origin') || ''
  const corsHeaders = setCorsHeaders(origin)
  try {
    const client = await clientPromise
    const db = client.db()
    const body = await request.json()

    if (!body.title || !body.questions) {
      return NextResponse.json(
        { error: 'Title and questions are required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const survey = {
      ...body,
      created_date: new Date(),
    }

    const result = await db.collection('surveys').insertOne(survey)

    return NextResponse.json(
      { message: 'Survey created', insertedId: result.insertedId },
      { headers: corsHeaders }
    )
  } catch (e) {
    console.error('Error creating survey:', e)
    return NextResponse.json(
      { error: 'Failed to create survey' },
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
