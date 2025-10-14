const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'cooliemate'
})
.then(() => console.log('✅ MongoDB Connected to cooliemate database'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Porter Schema
const porterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{10}$/
  },
  badgeNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  station: {
    type: String,
    required: true,
    default: 'Kurnool Station'
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  image: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  totalTrips: {
    type: Number,
    default: 0
  },
  experience: {
    type: String,
    default: '1 year'
  },
  languages: {
    type: [String],
    default: ['English', 'Hindi']
  },
  specialization: {
    type: String,
    default: 'General Luggage'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

// Booking Schema
const bookingSchema = new mongoose.Schema({
  porterId: {
    type: String,
    required: true
  },
  porterName: {
    type: String,
    required: true
  },
  passengerName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  pnr: String,
  station: String,
  trainNo: String,
  trainName: String,
  coachNo: String,
  boardingStation: String,
  boardingStationCode: String,
  destinationStation: String,
  destinationStationCode: String,
  dateOfJourney: String,
  arrivalTime: String,
  numberOfBags: Number,
  weight: Number,
  isLateNight: Boolean,
  isPriority: Boolean,
  totalPrice: Number,
  notes: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Review Schema
const reviewSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true
  },
  userName: String,
  userPhone: String,
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: String,
  experience: String,
  porterRating: Number,
  porterId: String,
  porterName: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
porterSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
porterSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Porter = mongoose.model('Porter', porterSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Review = mongoose.model('Review', reviewSchema);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'porter-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, porter) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.porter = porter;
    next();
  });
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Register Porter
app.post('/api/porter/register', upload.single('image'), async (req, res) => {
  try {
    const { name, phone, badgeNumber, station, password } = req.body;

    if (!name || !phone || !badgeNumber || !station || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Profile image is required'
      });
    }

    const existingPorter = await Porter.findOne({
      $or: [{ phone }, { badgeNumber }]
    });

    if (existingPorter) {
      return res.status(400).json({
        success: false,
        message: 'Porter with this phone number or badge number already exists'
      });
    }

    const porter = new Porter({
      name,
      phone,
      badgeNumber,
      station,
      password,
      image: req.file.filename
    });

    await porter.save();

    const token = jwt.sign(
      { id: porter._id, badgeNumber: porter.badgeNumber },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Porter registered successfully',
      data: {
        id: porter._id,
        name: porter.name,
        phone: porter.phone,
        badgeNumber: porter.badgeNumber,
        station: porter.station,
        image: porter.image,
        isOnline: porter.isOnline,
        token
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// Login Porter
app.post('/api/porter/login', async (req, res) => {
  try {
    const { badgeNumber, password } = req.body;

    if (!badgeNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'Badge number and password are required'
      });
    }

    const porter = await Porter.findOne({ badgeNumber });
    if (!porter) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await porter.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { id: porter._id, badgeNumber: porter.badgeNumber },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    porter.isOnline = true;
    porter.lastSeen = Date.now();
    await porter.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: porter._id,
        name: porter.name,
        phone: porter.phone,
        badgeNumber: porter.badgeNumber,
        station: porter.station,
        image: porter.image,
        isOnline: porter.isOnline,
        rating: porter.rating,
        totalTrips: porter.totalTrips,
        experience: porter.experience,
        languages: porter.languages,
        specialization: porter.specialization,
        token
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// Get Porter Profile (Protected Route)
app.get('/api/porter/profile', authenticateToken, async (req, res) => {
  try {
    const porter = await Porter.findById(req.porter.id).select('-password');
    
    if (!porter) {
      return res.status(404).json({
        success: false,
        message: 'Porter not found'
      });
    }

    res.json({
      success: true,
      data: porter
    });

  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get available (online) porters for booking
app.get('/api/porters/available', async (req, res) => {
  try {
    const { station } = req.query;
    
    let query = { isOnline: true, isVerified: true };
    if (station) {
      query.station = station;
    }

    const porters = await Porter.find(query)
      .select('-password')
      .sort({ rating: -1, totalTrips: -1 });

    res.json({
      success: true,
      count: porters.length,
      data: porters.map(porter => ({
        id: porter.badgeNumber,
        _id: porter._id,
        name: porter.name,
        photo: `${req.protocol}://${req.get('host')}/uploads/${porter.image}`,
        station: porter.station,
        rating: porter.rating,
        totalTrips: porter.totalTrips,
        experience: porter.experience,
        phone: porter.phone,
        languages: porter.languages,
        specialization: porter.specialization,
        availability: 'Available Now',
        badge: 'Verified',
        isOnline: porter.isOnline,
        lastSeen: porter.lastSeen
      }))
    });

  } catch (error) {
    console.error('Fetch Available Porters Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update porter online status
app.patch('/api/porter/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isOnline } = req.body;

    const porter = await Porter.findById(id);
    
    if (!porter) {
      return res.status(404).json({
        success: false,
        message: 'Porter not found'
      });
    }

    porter.isOnline = isOnline;
    porter.lastSeen = Date.now();
    await porter.save();

    res.json({
      success: true,
      message: `Porter status updated to ${isOnline ? 'online' : 'offline'}`,
      data: {
        isOnline: porter.isOnline,
        lastSeen: porter.lastSeen
      }
    });

  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Create Booking
app.post('/api/bookings', async (req, res) => {
  try {
    const bookingData = req.body;
    
    const booking = new Booking(bookingData);
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: booking._id,
        ...booking.toObject()
      }
    });

  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get booking by ID
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      booking: booking
    });

  } catch (error) {
    console.error('Fetch Booking Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get porter's bookings
app.get('/api/porter/:porterId/bookings', authenticateToken, async (req, res) => {
  try {
    const { porterId } = req.params;
    const { status } = req.query;

    let query = { porterId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error('Fetch Porter Bookings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Accept/Decline Booking
app.patch('/api/bookings/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['accepted', 'declined', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = status;
    booking.updatedAt = Date.now();
    await booking.save();

    // Update porter's total trips if completed
    if (status === 'completed') {
      const porter = await Porter.findOne({ badgeNumber: booking.porterId });
      if (porter) {
        porter.totalTrips += 1;
        await porter.save();
      }
    }

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking: booking
    });

  } catch (error) {
    console.error('Update Booking Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Submit Review
app.post('/api/reviews', async (req, res) => {
  try {
    const reviewData = req.body;
    
    const review = new Review(reviewData);
    await review.save();

    // Update porter's rating
    if (reviewData.porterId && reviewData.porterRating) {
      const porter = await Porter.findOne({ badgeNumber: reviewData.porterId });
      if (porter) {
        // Calculate new average rating
        const reviews = await Review.find({ porterId: reviewData.porterId });
        const totalRating = reviews.reduce((sum, r) => sum + r.porterRating, 0);
        porter.rating = parseFloat((totalRating / reviews.length).toFixed(1));
        await porter.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: review
    });

  } catch (error) {
    console.error('Submit Review Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});