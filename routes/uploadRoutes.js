const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const uploadController = require('../controllers/uploadController');

// Route to upload a single file
router.post('/single', upload.single('file'), uploadController.uploadSingle);

// Route to upload multiple files
router.post('/multiple', upload.array('files', 5), uploadController.uploadMultiple);

module.exports = router;
