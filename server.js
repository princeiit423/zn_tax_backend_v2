
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const User = require('./src/models/User')
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

// In first run create admin user and password
async function createAdmin() {
  const exists = await User.findOne({ email: process.env.ADMIN_EMAIL })
  if (exists) {
    console.log('Admin already exists')
    process.exit()
  }

  const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)

  await User.create({
    name: 'Admin',
    email: process.env.ADMIN_EMAIL,
    password: hashed
  })

  console.log('Admin created')
  process.exit()
}

createAdmin()


app.get('/', (req, res) => {
  res.send('ZN Tax Backend Running')
})

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})
