import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

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

  return headers
}

// PUT
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const origin = request.headers.get('origin') || ''
  const corsHeaders = setCorsHeaders(origin)
  try {
    const client = await clientPromise
    const db = client.db()

    const surveyId = new ObjectId(params.id)
    const body = await request.json()

    const { _id, ...updateData } = body

    const result = await db
      .collection('surveys')
      .updateOne({ _id: surveyId }, { $set: updateData })

    return NextResponse.json(
      {
        message: 'Survey updated',
        modifiedCount: result.modifiedCount,
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Error updating survey:', error)
    return NextResponse.json(
      { message: 'Failed to update survey', error },
      { status: 500, headers: corsHeaders }
    )
  }
}

// DELETE
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const origin = request.headers.get('origin') || ''
  const corsHeaders = setCorsHeaders(origin)
  try {
    const client = await clientPromise
    const db = client.db()

    const surveyId = new ObjectId(params.id)
    const result = await db.collection('surveys').deleteOne({ _id: surveyId })

    return NextResponse.json(
      {
        message: 'Survey deleted',
        deletedCount: result.deletedCount,
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Error deleting survey:', error)
    return NextResponse.json(
      { message: 'Failed to delete survey', error },
      { status: 500, headers: corsHeaders }
    )
  }
}

// OPTIONS (Handle CORS preflight)
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || ''
  const corsHeaders = setCorsHeaders(origin)
  return NextResponse.json({}, { headers: corsHeaders })
}
