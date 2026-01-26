require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User')

mongoose.connect(process.env.MONGO_URI)

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
