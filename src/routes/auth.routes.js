const router = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const auth = require('../middleware/auth')

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// ================= LOGOUT =================
router.post('/logout', auth, async (req, res) => {
  try {
    // JWT stateless hai — backend me kuch destroy nahi hota
    // Frontend token delete karega

    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Logout failed'
    })
  }
})
module.exports = router
