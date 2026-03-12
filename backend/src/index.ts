import express from 'express';

const app = express()

app.use(express.json())

app.get("/", (req, res) => {
  res.json({ message: "Grade Management API running" })
})

module.exports = app