import express from 'express'
import fetch from 'node-fetch'

const app = express()
app.use(express.text()) // รองรับ text/plain payload

app.post('/api/translate-log', async (req, res) => {
  try {
    const response = await fetch(
      'https://translate.googleapis.com/element/log?hasfast=true&authuser=0&format=json',
      {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: req.body,
      }
    )

    const data = await response.text()
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.listen(3001, () => console.log('Proxy server running on port 3001'))
