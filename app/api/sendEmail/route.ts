import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  const res = new NextResponse()

  const headers = new Headers()
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'POST')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')

  const { name, email, phone, message } = await request.json()

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  try {
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: 'ye.wang@dv8energy.com, wang77289271@gmail.com',
      subject: 'Message From POC Gateway Page',
      text: `New message from poc gateway contact form:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`,
    })

    return NextResponse.json({ status: 'Email Sent' }, { status: 200, headers })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { status: 'Email Not Sent', error: (error as Error).message },
      { status: 500, headers }
    )
  }
}

export async function OPTIONS() {
  const headers = new Headers({
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
  })

  return new Response(null, { status: 204, headers })
}
