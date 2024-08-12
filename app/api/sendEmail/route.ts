import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  const res = new NextResponse()

  const headers = new Headers()
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'POST')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')

  const {
    name,
    email,
    phone,
    message,
    'g-recaptcha-response': recaptchaToken,
  } = await request.json()

  // Verify reCAPTCHA
  const recaptchaResponse = await fetch(
    `https://www.google.com/recaptcha/api/siteverify`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.RECAPTCHA_V2_SITE_KEY}&response=${recaptchaToken}`,
    }
  )
  const recaptchaData = await recaptchaResponse.json()

  if (!recaptchaData.success) {
    return new Response(
      JSON.stringify({ status: 'CAPTCHA verification failed' }),
      { status: 400 }
    )
  }

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
      to: 'ye.wang@dv8energy.com',
      // to: 'ye.wang@dv8energy.com, info@dv8energy.com',
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
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
  })

  return new Response(null, { status: 204, headers })
}
