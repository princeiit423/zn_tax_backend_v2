
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./src/config/db')

const authRoutes = require('./src/routes/auth.routes')
const fileRoutes = require('./src/routes/file.routes')
const adminRoutes= require("./src/routes/admin.routes")

const app = express()

connectDB()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/admin',adminRoutes)

app.get('/', (req, res) => {
  res.send('ZN Tax Backend Running')
})

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})
