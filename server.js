const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/nyumbapopote', { useNewUrlParser: true, useUnifiedTopology: true });

// House Schema
const houseSchema = new mongoose.Schema({
  title: String,
  location: String,
  price: Number,
  owner: String,
  description: String,
  images: {
    front: String,
    rear: String,
    interior: String,
    backyard: String
  }
});
const House = mongoose.model('House', houseSchema);

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// Upload images to panels
app.post('/api/houses/:id/images', upload.fields([
  { name: 'front', maxCount: 1 },
  { name: 'rear', maxCount: 1 },
  { name: 'interior', maxCount: 1 },
  { name: 'backyard', maxCount: 1 }
]), async (req, res) => {
  const house = await House.findById(req.params.id);
  if (!house) return res.status(404).send("House not found");

  ['front', 'rear', 'interior', 'backyard'].forEach(panel => {
    if (req.files[panel]) {
      house.images[panel] = `/uploads/${req.files[panel][0].filename}`;
    }
  });

  await house.save();
  res.json(house);
});

// Serve image files statically
app.use('/uploads', express.static('uploads'));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
