import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Forward payload จาก frontend ไป Google API
    const response = await fetch(
      'https://translate.googleapis.com/element/log?hasfast=true&authuser=0&format=json',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
        },
        body: req.body, // forward payload ตรง ๆ
      }
    )

    const data = await response.text()
    res.status(200).json({ success: true, data })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}
