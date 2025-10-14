// server.js - CooliMate Backend Server (Complete with Porter Auth, Analytics, Notifications & Reviews)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads/porters';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'porter-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// ==================== MONGODB CONNECTION WITH RETRY LOGIC ====================
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coolimate', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB Connected Successfully');
    console.log(`📍 Database Host: ${conn.connection.host}`);
    console.log(`📦 Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
  setTimeout(connectDB, 5000);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully');
});

// Middleware to check DB connection
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      error: 'Database temporarily unavailable',
      message: 'Please try again in a moment'
    });
  }
  next();
});

// ==================== SCHEMAS ====================

// Porter Schema
const porterSchema = new mongoose.Schema({
  cooliemate_id: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{10}$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  badge_no: {
    type: String,
    required: true,
    trim: true,
  },
  station: {
    type: String,
    required: true,
    trim: true,
  },
  photo: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalBookings: {
    type: Number,
    default: 0,
  },
  completedBookings: {
    type: Number,
    default: 0,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
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

// Booking Schema
const bookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  porterId: { type: String, required: true, index: true },
  porterName: { type: String, required: true },
  passengerName: { type: String, required: true },
  phone: { type: String, required: true },
  pnr: { type: String, required: true },
  station: { type: String, required: true },
  trainNo: { type: String, required: true },
  trainName: { type: String, required: true },
  coachNo: { type: String, required: true },
  boardingStation: { type: String, required: true },
  boardingStationCode: { type: String, required: true },
  destinationStation: { type: String, required: true },
  destinationStationCode: { type: String, required: true },
  dateOfJourney: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  numberOfBags: { type: Number, required: true },
  weight: { type: Number, required: true },
  isLateNight: { type: Boolean, default: false },
  isPriority: { type: Boolean, default: false },
  totalPrice: { type: Number, required: true },
  notes: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'completed', 'declined'],
    default: 'pending',
    index: true
  },
  requestedAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date },
  completedAt: { type: Date },
  declinedAt: { type: Date }
}, {
  timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);

// Analytics/Visit Schema
const visitSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userAgent: String,
  ipAddress: String,
  device: String,
  browser: String,
  os: String,
  location: {
    city: String,
    region: String,
    country: String
  },
  pages: [{
    path: String,
    timestamp: Date,
    duration: Number
  }],
  firstVisit: { type: Date, default: Date.now },
  lastVisit: { type: Date, default: Date.now },
  totalVisits: { type: Number, default: 1 },
  isBookingCompleted: { type: Boolean, default: false },
  bookingId: String
}, {
  timestamps: true
});

const Visit = mongoose.model('Visit', visitSchema);

// Review Schema
const reviewSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  userId: String,
  userName: { type: String, required: true },
  userPhone: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  experience: {
    type: String,
    enum: ['excellent', 'good', 'average', 'poor'],
    required: true
  },
  porterRating: { type: Number, min: 1, max: 5 },
  porterId: String,
  porterName: String,
  isApproved: { type: Boolean, default: false },
  isDisplayed: { type: Boolean, default: false },
  helpful: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Review = mongoose.model('Review', reviewSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  recipientId: { type: String, required: true, index: true },
  recipientType: { type: String, enum: ['passenger', 'porter', 'admin'], required: true },
  type: {
    type: String,
    enum: ['booking_created', 'booking_accepted', 'booking_declined', 'booking_completed', 'review_request', 'payment_received'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  bookingId: String,
  isRead: { type: Boolean, default: false },
  isSoundPlayed: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now, expires: 2592000 }
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

// ==================== HELPER FUNCTIONS ====================

// Generate unique CoolieMate ID
async function generateCoolieMateId() {
  const prefix = 'CM';
  const year = new Date().getFullYear().toString().slice(-2);
  
  // Get the count of porters to generate sequential number
  const count = await Porter.countDocuments();
  const sequenceNum = (count + 1).toString().padStart(4, '0');
  
  return `${prefix}${year}${sequenceNum}`;
}

async function createNotification(data) {
  try {
    const notification = new Notification(data);
    await notification.save();
    console.log('🔔 Notification created:', notification.type);
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
}

// Middleware to verify JWT token
const authenticatePorter = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const porter = await Porter.findById(decoded.porterId).select('-password');
    
    if (!porter) {
      return res.status(401).json({ error: 'Porter not found' });
    }

    req.porter = porter;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ==================== BASIC ROUTES ====================

// Health Check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({ 
    status: dbStatus === 1 ? 'OK' : 'Degraded', 
    message: 'CooliMate Backend is running!',
    database: statusMap[dbStatus],
    timestamp: new Date().toISOString()
  });
});

// ==================== PORTER AUTHENTICATION ROUTES ====================

// PORTER REGISTRATION
app.post('/api/porter/register', upload.single('photo'), async (req, res) => {
  try {
    const { name, mobile, password, badge_no, station } = req.body;

    // Validation
    if (!name || !mobile || !password || !badge_no || !station) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'mobile', 'password', 'badge_no', 'station']
      });
    }

    // Check mobile number format
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        error: 'Invalid mobile number',
        message: 'Mobile number must be 10 digits'
      });
    }

    // Check if porter already exists
    const existingPorter = await Porter.findOne({ mobile });
    if (existingPorter) {
      return res.status(409).json({
        error: 'Porter already exists',
        message: 'This mobile number is already registered'
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Weak password',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Generate unique CoolieMate ID
    const cooliemate_id = await generateCoolieMateId();

    // Create new porter
    const porter = new Porter({
      cooliemate_id,
      name,
      mobile,
      password,
      badge_no,
      station,
      photo: req.file ? `/uploads/porters/${req.file.filename}` : null
    });

    await porter.save();

    // Generate JWT token
    const token = jwt.sign(
      { porterId: porter._id, cooliemateId: cooliemate_id },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('✅ New porter registered:', cooliemate_id);

    res.status(201).json({
      success: true,
      message: 'Porter registered successfully',
      porter: {
        id: porter._id,
        cooliemate_id: porter.cooliemate_id,
        name: porter.name,
        mobile: porter.mobile,
        badge_no: porter.badge_no,
        station: porter.station,
        photo: porter.photo,
        isActive: porter.isActive,
        isVerified: porter.isVerified,
        registeredAt: porter.registeredAt
      },
      token
    });
  } catch (error) {
    console.error('❌ Error registering porter:', error);
    
    // Delete uploaded file if registration fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate entry',
        message: 'Mobile number or badge number already exists'
      });
    }

    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

// PORTER LOGIN
app.post('/api/porter/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;

    // Validation
    if (!mobile || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Mobile number and password are required'
      });
    }

    // Check mobile number format
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        error: 'Invalid mobile number',
        message: 'Mobile number must be 10 digits'
      });
    }

    // Find porter by mobile
    const porter = await Porter.findOne({ mobile });
    if (!porter) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Mobile number or password is incorrect'
      });
    }

    // Check if porter is active
    if (!porter.isActive) {
      return res.status(403).json({
        error: 'Account deactivated',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await porter.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Mobile number or password is incorrect'
      });
    }

    // Update last active
    porter.lastActive = new Date();
    await porter.save();

    // Generate JWT token
    const token = jwt.sign(
      { porterId: porter._id, cooliemateId: porter.cooliemate_id },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('✅ Porter logged in:', porter.cooliemate_id);

    res.json({
      success: true,
      message: 'Login successful',
      porter: {
        id: porter._id,
        cooliemate_id: porter.cooliemate_id,
        name: porter.name,
        mobile: porter.mobile,
        badge_no: porter.badge_no,
        station: porter.station,
        photo: porter.photo,
        isActive: porter.isActive,
        isVerified: porter.isVerified,
        rating: porter.rating,
        totalBookings: porter.totalBookings,
        completedBookings: porter.completedBookings,
        totalEarnings: porter.totalEarnings,
        lastActive: porter.lastActive
      },
      token
    });
  } catch (error) {
    console.error('❌ Error during login:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

// GET PORTER PROFILE (Protected Route)
app.get('/api/porter/profile', authenticatePorter, async (req, res) => {
  try {
    res.json({
      success: true,
      porter: req.porter
    });
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
});

// UPDATE PORTER PROFILE (Protected Route)
app.patch('/api/porter/profile', authenticatePorter, upload.single('photo'), async (req, res) => {
  try {
    const { name, station, badge_no } = req.body;
    const porter = req.porter;

    if (name) porter.name = name;
    if (station) porter.station = station;
    if (badge_no) porter.badge_no = badge_no;
    
    if (req.file) {
      // Delete old photo if exists
      if (porter.photo) {
        const oldPhotoPath = path.join(__dirname, porter.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      porter.photo = `/uploads/porters/${req.file.filename}`;
    }

    await porter.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      porter
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

// GET ALL PORTERS (Public - for booking)
app.get('/api/porters', async (req, res) => {
  try {
    const { station } = req.query;
    
    const query = { isActive: true };
    if (station) {
      query.station = new RegExp(station, 'i');
    }

    const porters = await Porter.find(query)
      .select('-password')
      .sort({ rating: -1, completedBookings: -1 })
      .limit(50);

    res.json({
      success: true,
      count: porters.length,
      porters
    });
  } catch (error) {
    console.error('❌ Error fetching porters:', error);
    res.status(500).json({
      error: 'Failed to fetch porters',
      message: error.message
    });
  }
});

// GET PORTER BY ID (Public)
app.get('/api/porters/:porterId', async (req, res) => {
  try {
    const porter = await Porter.findById(req.params.porterId).select('-password');
    
    if (!porter) {
      return res.status(404).json({
        error: 'Porter not found'
      });
    }

    res.json({
      success: true,
      porter
    });
  } catch (error) {
    console.error('❌ Error fetching porter:', error);
    res.status(500).json({
      error: 'Failed to fetch porter',
      message: error.message
    });
  }
});

// ==================== BOOKING ROUTES ====================

// CREATE - Passenger creates a new booking request
app.post('/api/bookings', async (req, res) => {
  try {
    const bookingData = req.body;
    
    if (!bookingData.porterId || !bookingData.passengerName) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['porterId', 'passengerName', 'phone', 'pnr']
      });
    }

    if (!bookingData.id) {
      bookingData.id = `BK${Date.now()}`;
    }

    const booking = new Booking(bookingData);
    await booking.save();

    // Update porter's total bookings
    await Porter.findByIdAndUpdate(bookingData.porterId, {
      $inc: { totalBookings: 1 }
    });

    // Create notification for porter
    await createNotification({
      recipientId: booking.porterId,
      recipientType: 'porter',
      type: 'booking_created',
      title: 'New Booking Request',
      message: `New booking from ${booking.passengerName} at ${booking.station}`,
      bookingId: booking.id,
      priority: 'high'
    });

    console.log('✅ New booking created:', booking.id);
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: booking
    });
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'Booking ID already exists',
        message: 'Please try again'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create booking',
      message: error.message 
    });
  }
});

// READ - Get all bookings for a specific porter
app.get('/api/bookings/porter/:porterId', async (req, res) => {
  try {
    const { porterId } = req.params;
    const { status } = req.query;

    const query = { 
      porterId,
      status: { $ne: 'declined' }
    };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ requestedAt: -1 })
      .maxTimeMS(20000);

    console.log(`📦 Fetched ${bookings.length} bookings for porter ${porterId}`);

    res.json({
      success: true,
      count: bookings.length,
      bookings: bookings
    });
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch bookings',
      message: error.message 
    });
  }
});

// READ - Get a specific booking by ID
app.get('/api/bookings/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findOne({ id: bookingId })
      .maxTimeMS(10000);

    if (!booking) {
      return res.status(404).json({ 
        error: 'Booking not found',
        bookingId: bookingId
      });
    }

    res.json({
      success: true,
      booking: booking
    });
  } catch (error) {
    console.error('❌ Error fetching booking:', error);
    res.status(500).json({ 
      error: 'Failed to fetch booking',
      message: error.message 
    });
  }
});

// UPDATE - Porter accepts a booking
app.patch('/api/bookings/:bookingId/accept', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOneAndUpdate(
      { id: bookingId, status: 'pending' },
      { 
        status: 'accepted',
        acceptedAt: new Date()
      },
      { new: true }
    ).maxTimeMS(10000);

    if (!booking) {
      return res.status(404).json({ 
        error: 'Booking not found or already processed'
      });
    }

    // Create notification for passenger
    await createNotification({
      recipientId: booking.phone,
      recipientType: 'passenger',
      type: 'booking_accepted',
      title: 'Booking Accepted!',
      message: `${booking.porterName} has accepted your request and is on the way`,
      bookingId: booking.id,
      priority: 'high'
    });

    console.log('✅ Booking accepted:', bookingId);

    res.json({
      success: true,
      message: 'Booking accepted successfully',
      booking: booking
    });
  } catch (error) {
    console.error('❌ Error accepting booking:', error);
    res.status(500).json({ 
      error: 'Failed to accept booking',
      message: error.message 
    });
  }
});

// UPDATE - Porter completes a booking
app.patch('/api/bookings/:bookingId/complete', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOneAndUpdate(
      { id: bookingId, status: 'accepted' },
      { 
        status: 'completed',
        completedAt: new Date()
      },
      { new: true }
    ).maxTimeMS(10000);

    if (!booking) {
      return res.status(404).json({ 
        error: 'Booking not found or not in accepted state'
      });
    }

    // Update porter's completed bookings and earnings
    await Porter.findByIdAndUpdate(booking.porterId, {
      $inc: { 
        completedBookings: 1,
        totalEarnings: booking.totalPrice
      }
    });

    // Create notification for passenger with review request
    await createNotification({
      recipientId: booking.phone,
      recipientType: 'passenger',
      type: 'review_request',
      title: 'Service Completed!',
      message: `Your service is complete. Please rate your experience with ${booking.porterName}`,
      bookingId: booking.id,
      priority: 'low'
    });

    console.log('✅ Booking completed:', bookingId);

    res.json({
      success: true,
      message: 'Booking completed successfully',
      booking: booking
    });
  } catch (error) {
    console.error('❌ Error completing booking:', error);
    res.status(500).json({ 
      error: 'Failed to complete booking',
      message: error.message 
    });
  }
});

// UPDATE - Porter declines a booking
app.patch('/api/bookings/:bookingId/decline', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOneAndUpdate(
      { id: bookingId, status: 'pending' },
      { 
        status: 'declined',
        declinedAt: new Date()
      },
      { new: true }
    ).maxTimeMS(10000);

    if (!booking) {
      return res.status(404).json({ 
        error: 'Booking not found or already processed'
      });
    }

    // Create notification for passenger
    await createNotification({
      recipientId: booking.phone,
      recipientType: 'passenger',
      type: 'booking_declined',
      title: 'Booking Declined',
      message: `Sorry, ${booking.porterName} is unavailable. Please try another porter.`,
      bookingId: booking.id,
      priority: 'medium'
    });

    console.log('❌ Booking declined:', bookingId);

    res.json({
      success: true,
      message: 'Booking declined successfully',
      booking: booking
    });
  } catch (error) {
    console.error('❌ Error declining booking:', error);
    res.status(500).json({ 
      error: 'Failed to decline booking',
      message: error.message 
    });
  }
});

// GET - Porter statistics
app.get('/api/porter/:porterId/stats', async (req, res) => {
  try {
    const { porterId } = req.params;

    const stats = await Booking.aggregate([
      { $match: { porterId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalEarnings: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'completed'] }, '$totalPrice', 0] 
            }
          }
        }
      }
    ]).maxTimeMS(15000);

    const formattedStats = {
      pending: 0,
      accepted: 0,
      completed: 0,
      totalEarnings: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      if (stat._id === 'completed') {
        formattedStats.totalEarnings = stat.totalEarnings;
      }
    });

    res.json({
      success: true,
      porterId: porterId,
      stats: formattedStats
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      message: error.message 
    });
  }
});

// DELETE - Delete a booking (admin only)
app.delete('/api/bookings/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOneAndDelete({ id: bookingId })
      .maxTimeMS(10000);

    if (!booking) {
      return res.status(404).json({ 
        error: 'Booking not found'
      });
    }

    console.log('🗑️ Booking deleted:', bookingId);

    res.json({
      success: true,
      message: 'Booking deleted successfully',
      booking: booking
    });
  } catch (error) {
    console.error('❌ Error deleting booking:', error);
    res.status(500).json({ 
      error: 'Failed to delete booking',
      message: error.message 
    });
  }
});

// ==================== ANALYTICS ROUTES ====================

// Track page visit
app.post('/api/analytics/visit', async (req, res) => {
  try {
    const { sessionId, userAgent, page, device, browser, os } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'];

    let visit = await Visit.findOne({ sessionId });

    if (visit) {
      visit.lastVisit = new Date();
      visit.totalVisits += 1;
      visit.pages.push({
        path: page,
        timestamp: new Date()
      });
    } else {
      visit = new Visit({
        sessionId,
        userAgent,
        ipAddress,
        device,
        browser,
        os,
        pages: [{
          path: page,
          timestamp: new Date()
        }]
      });
    }

    await visit.save();

    res.json({
      success: true,
      message: 'Visit tracked successfully'
    });
  } catch (error) {
    console.error('❌ Error tracking visit:', error);
    res.status(500).json({ error: 'Failed to track visit' });
  }
});

// Link visit to booking
app.patch('/api/analytics/visit/:sessionId/booking', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { bookingId } = req.body;

    const visit = await Visit.findOneAndUpdate(
      { sessionId },
      { 
        isBookingCompleted: true,
        bookingId: bookingId
      },
      { new: true }
    );

    res.json({
      success: true,
      visit: visit
    });
  } catch (error) {
    console.error('❌ Error linking booking:', error);
    res.status(500).json({ error: 'Failed to link booking' });
  }
});

// Get analytics dashboard data (ADMIN)
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const totalVisits = await Visit.countDocuments(dateFilter);
    const uniqueVisitors = await Visit.countDocuments({ 
      ...dateFilter,
      totalVisits: 1 
    });
    const totalBookings = await Booking.countDocuments(dateFilter);
    const conversionRate = totalVisits > 0 
      ? ((totalBookings / totalVisits) * 100).toFixed(2)
      : 0;

    const bookingsByStatus = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    const deviceStats = await Visit.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$device',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentBookings = await Booking.find(dateFilter)
      .sort({ requestedAt: -1 })
      .limit(10)
      .select('id passengerName phone station trainNo status totalPrice requestedAt');

    const topPorters = await Review.aggregate([
      { $match: { isApproved: true } },
      {
        $group: {
          _id: '$porterId',
          porterName: { $first: '$porterName' },
          avgRating: { $avg: '$porterRating' },
          totalReviews: { $sum: 1 }
        }
      },
      { $sort: { avgRating: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalVisits,
          uniqueVisitors,
          totalBookings,
          conversionRate: `${conversionRate}%`,
          totalRevenue: bookingsByStatus.reduce((sum, b) => sum + b.totalRevenue, 0)
        },
        bookingsByStatus: bookingsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        deviceStats: deviceStats.reduce((acc, item) => {
          acc[item._id || 'unknown'] = item.count;
          return acc;
        }, {}),
        recentBookings,
        topPorters
      }
    });
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ==================== NOTIFICATION ROUTES ====================

// Get user notifications
app.get('/api/notifications/:recipientId', async (req, res) => {
  try {
    const { recipientId } = req.params;
    const { type, unreadOnly } = req.query;

    const query = { recipientId };
    if (type) query.recipientType = type;
    if (unreadOnly === 'true') query.isRead = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipientId,
      isRead: false
    });

    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
app.patch('/api/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true, isSoundPlayed: true },
      { new: true }
    );

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('❌ Error marking notification:', error);
    res.status(500).json({ error: 'Failed to mark notification' });
  }
});

// Mark all notifications as read
app.patch('/api/notifications/:recipientId/read-all', async (req, res) => {
  try {
    const { recipientId } = req.params;

    await Notification.updateMany(
      { recipientId, isRead: false },
      { isRead: true, isSoundPlayed: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('❌ Error marking all notifications:', error);
    res.status(500).json({ error: 'Failed to mark notifications' });
  }
});

// ==================== REVIEW ROUTES ====================

// Create review
app.post('/api/reviews', async (req, res) => {
  try {
    const reviewData = req.body;

    const booking = await Booking.findOne({ 
      id: reviewData.bookingId,
      status: 'completed'
    });

    if (!booking) {
      return res.status(400).json({ 
        error: 'Booking not found or not completed' 
      });
    }

    const existingReview = await Review.findOne({ 
      bookingId: reviewData.bookingId 
    });

    if (existingReview) {
      return res.status(409).json({ 
        error: 'Review already submitted for this booking' 
      });
    }

    // Auto-approve 4-5 star reviews
    if (reviewData.rating >= 4) {
      reviewData.isApproved = true;
      reviewData.isDisplayed = true;
    }

    const review = new Review(reviewData);
    await review.save();

    // Update porter's rating
    if (reviewData.porterId && reviewData.porterRating) {
      const reviews = await Review.find({ 
        porterId: reviewData.porterId, 
        isApproved: true 
      });
      
      const totalRating = reviews.reduce((sum, r) => sum + (r.porterRating || 0), 0);
      const avgRating = totalRating / reviews.length;
      
      await Porter.findByIdAndUpdate(reviewData.porterId, {
        rating: avgRating.toFixed(1)
      });
    }

    console.log('⭐ Review created:', review._id);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('❌ Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Get reviews for homepage (approved and high-rated only)
app.get('/api/reviews/public', async (req, res) => {
  try {
    const reviews = await Review.find({
      isApproved: true,
      isDisplayed: true,
      rating: { $gte: 4 }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('userName rating comment experience createdAt porterName');

    const avgRating = await Review.aggregate([
      { $match: { isApproved: true } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      reviews,
      stats: avgRating[0] || { avgRating: 0, totalReviews: 0 }
    });
  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get all reviews (ADMIN)
app.get('/api/reviews/admin', async (req, res) => {
  try {
    const { status, minRating } = req.query;

    const query = {};
    if (status === 'pending') query.isApproved = false;
    if (status === 'approved') query.isApproved = true;
    if (minRating) query.rating = { $gte: parseInt(minRating) };

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('❌ Error fetching admin reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Approve/Reject review (ADMIN)
app.patch('/api/reviews/:reviewId/moderate', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isApproved, isDisplayed } = req.body;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isApproved, isDisplayed },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Review moderated successfully',
      review
    });
  } catch (error) {
    console.error('❌ Error moderating review:', error);
    res.status(500).json({ error: 'Failed to moderate review' });
  }
});

// ==================== ERROR HANDLERS ====================

app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size should not exceed 5MB'
      });
    }
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 CooliMate Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`⏳ MongoDB connection status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
  console.log(`\n📋 Available Routes:`);
  console.log(`   🔐 Porter Auth:`);
  console.log(`      - POST /api/porter/register - Register new porter`);
  console.log(`      - POST /api/porter/login - Porter login`);
  console.log(`      - GET /api/porter/profile - Get porter profile (Protected)`);
  console.log(`      - PATCH /api/porter/profile - Update porter profile (Protected)`);
  console.log(`      - GET /api/porters - Get all porters`);
  console.log(`      - GET /api/porters/:porterId - Get porter by ID`);
  console.log(`   📦 Bookings:`);
  console.log(`      - POST /api/bookings - Create booking`);
  console.log(`      - GET /api/bookings/porter/:porterId - Get porter bookings`);
  console.log(`      - PATCH /api/bookings/:bookingId/accept - Accept booking`);
  console.log(`      - PATCH /api/bookings/:bookingId/complete - Complete booking`);
  console.log(`      - PATCH /api/bookings/:bookingId/decline - Decline booking`);
  console.log(`   📊 Analytics:`);
  console.log(`      - GET /api/analytics/dashboard - Analytics dashboard`);
  console.log(`      - POST /api/analytics/visit - Track visits`);
  console.log(`   🔔 Notifications:`);
  console.log(`      - GET /api/notifications/:recipientId - Get notifications`);
  console.log(`      - PATCH /api/notifications/:notificationId/read - Mark as read`);
  console.log(`   ⭐ Reviews:`);
  console.log(`      - POST /api/reviews - Create review`);
  console.log(`      - GET /api/reviews/public - Get public reviews`);
});