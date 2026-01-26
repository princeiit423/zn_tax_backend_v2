
const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
  fileName: String,
  fileType:String,
  fileUrl: String,
  cloudinaryId: String, // 🔥 important
  financialYear: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model('File', fileSchema)
