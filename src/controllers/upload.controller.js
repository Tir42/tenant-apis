const uploadImage = (req, res) => {
  res.status(200).json({
    success: true,
    imagePath: `/uploads/${req.file.filename}`,
  });
};

module.exports = {
  uploadImage,
};
