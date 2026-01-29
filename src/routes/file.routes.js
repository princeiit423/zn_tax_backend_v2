const router = require('express').Router()
const multer = require('multer')
const fs = require('fs')
const cloudinary = require('../config/cloudinary')
const File = require('../models/File')
const auth = require('../middleware/auth')

const upload = multer({ dest: 'tmp/' })

// Upload file (Admin panel)
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
       console.log("File info:", req.file);
      return res.status(400).json({ message: 'No file uploaded' })
      
    }
    const originalName = decodeURIComponent(req.file.originalname);
    //const originalName = req.file.originalname
    const extension = originalName.split('.').pop() // pdf

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'zn_tax_documents',
      resource_type: 'raw',
      public_id: `${originalName.split('.').slice(0, -1).join('.')}.${extension}` // add .pdf
    })

    fs.unlinkSync(req.file.path)

    const file = await File.create({
      fileName: originalName,
      fileType: req.body.fileType,
      fileUrl: result.secure_url,        // this will now include .pdf
      cloudinaryId: result.public_id,    // will include .pdf
      financialYear: req.body.financialYear,
      user: req.body.userId
    })

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: file
    })

  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload failed' })
  }
})


// Get logged-in user's files (with FY filter)
router.get('/my-files', auth, async (req, res) => {
  try {
    const { financialYear } = req.query
    const query = { user: req.user.id }
    if (financialYear) query.financialYear = financialYear

    const files = await File.find(query).sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      message: 'Files fetched successfully',
      count: files.length,
      data: files
    })

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch files',
      error: err.message
    })
  }
})

module.exports = router
