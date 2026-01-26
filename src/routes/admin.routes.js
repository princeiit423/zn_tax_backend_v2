const router = require('express').Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const File = require('../models/File')
const cloudinary = require('../config/cloudinary')
const auth = require('../middleware/auth')


router.post('/create-user', auth, async (req, res) => {
  const { name, email, password, pan, gstin, address } = req.body

  const exists = await User.findOne({ email })
  if (exists) return res.status(400).json({ message: 'User already exists' })

  const hashed = await bcrypt.hash(password, 10)

  const user = await User.create({
    name,
    email,
    password: hashed,
    pan,
    gstin,
    address
  })

  res.json(user)
})
/**
 * ================================
 * 📊 DASHBOARD STATS
 * ================================
 */
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    const totalClients = await User.countDocuments()
    const totalFiles = await File.countDocuments()

    res.status(200).json({
      success: true,
      message: 'Dashboard stats fetched successfully',
      data: {
        totalClients,
        totalFiles
      }
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    })
  }
})

/**
 * ================================
 * 👥 GET ALL CLIENTS
 * ================================
 */
router.get('/clients', auth, async (req, res) => {
  try {
    const clients = await User.find().select('-password')

    res.status(200).json({
      success: true,
      message: 'Clients fetched successfully',
      data: clients
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients'
    })
  }
})

/**
 * ================================
 * 📂 GET FILES OF A CLIENT
 * ================================
 */
router.get('/all-files', auth, async (req, res) => {
  try {
    const files = await File.find()
      .populate("user", "name email pan gstin")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      message: 'Client files fetched successfully',
      data: files
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client files'
    })
  }
})



router.get('/client/:id/files', auth, async (req, res) => {
  try {
    const files = await File.find({ user: req.params.id })
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      message: 'Client files fetched successfully',
      data: files
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client files'
    })
  }
})

/**
 * ================================
 * ❌ DELETE FILE (DB + CLOUDINARY)
 * ================================
 */
router.delete('/file/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id)

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      })
    }

    await cloudinary.uploader.destroy(file.cloudinaryId)
    await file.deleteOne()

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    })
  }
})

/**
 * ================================
 * ✏️ UPDATE CLIENT DETAILS
 * ================================
 */
router.put('/client/:id', auth, async (req, res) => {
  try {
    const updatedClient = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password')

    if (!updatedClient) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: updatedClient
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update client'
    })
  }
})

/**
 * ================================
 * 🗑️ DELETE CLIENT + ALL FILES
 * ================================
 */
router.delete('/client/:id', auth, async (req, res) => {
  try {
    const client = await User.findById(req.params.id)
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      })
    }

    const files = await File.find({ user: req.params.id })

    for (let file of files) {
      await cloudinary.uploader.destroy(file.cloudinaryId)
    }

    await File.deleteMany({ user: req.params.id })
    await User.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Client and all related files deleted successfully'
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete client'
    })
  }
})

module.exports = router
