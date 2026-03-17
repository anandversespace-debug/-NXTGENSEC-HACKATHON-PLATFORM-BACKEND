const uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({
      message: 'File uploaded successfully',
      url: req.file.path,
      public_id: req.file.filename,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const fileUrls = req.files.map(file => ({
      url: file.path,
      public_id: file.filename
    }));
    res.json({
      message: 'Files uploaded successfully',
      files: fileUrls
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple
};
