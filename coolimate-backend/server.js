const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

// Middleware - UPDATED CORS CONFIGURATION
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://cooliemate-etak.vercel.app',
    'https://www.cooliemate.in',
    'https://cooliemate.in'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// ==================== SCHEMAS ====================

// Porter Schema
const porterSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, match: /^[0-9]{10}$/ },
  badgeNumber: { type: String, required: true, unique: true, trim: true },
  station: { type: String, required: true, default: 'Kurnool Station' },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  isVerified: { type: Boolean, default: true },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  rating: { type: Number, default: 5.0, min: 0, max: 5 },
  totalTrips: { type: Number, default: 0 },
  experience: { type: String, default: '1 year' },
  languages: { type: [String], default: ['English', 'Hindi'] },
  specialization: { type: String, default: 'General Luggage' },
  registeredAt: { type: Date, default: Date.now }
});

// Booking Schema
const bookingSchema = new mongoose.Schema({
  porterId: { type: String, required: true },
  porterBadgeNumber: String,
  porterName: { type: String, required: true },
  passengerName: { type: String, required: true },
  phone: { type: String, required: true },
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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Review Schema
const reviewSchema = new mongoose.Schema({
  bookingId: { type: String, required: true },
  userName: String,
  userPhone: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  experience: String,
  porterRating: Number,
  porterId: String,
  porterName: String,
  createdAt: { type: Date, default: Date.now }
});

// **NEW: Analytics Schema for tracking visits**
const analyticsSchema = new mongoose.Schema({
  visitorId: { type: String, required: true },
  ipAddress: String,
  userAgent: String,
  device: { type: String, enum: ['mobile', 'tablet', 'desktop'], default: 'desktop' },
  page: String,
  referrer: String,
  timestamp: { type: Date, default: Date.now },
  sessionId: String,
  action: { type: String, enum: ['visit', 'booking', 'porter_view'], default: 'visit' }
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

porterSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Porter = mongoose.model('Porter', porterSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Review = mongoose.model('Review', reviewSchema);
const Analytics = mongoose.model('Analytics', analyticsSchema);

// ==================== HELPER FUNCTIONS ====================

// Detect device type from user agent
function detectDevice(userAgent) {
  if (!userAgent) return 'desktop';
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

// Generate visitor ID from IP and user agent
function generateVisitorId(ip, userAgent) {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(ip + userAgent).digest('hex');
}

// ==================== MIDDLEWARE ====================

// **NEW: Visitor tracking middleware**
app.use(async (req, res, next) => {
  // Only track page visits, not API calls to other endpoints
  if (req.path.startsWith('/api/') && !req.path.startsWith('/api/analytics/track')) {
    return next();
  }

  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const visitorId = generateVisitorId(ipAddress, userAgent);
    const device = detectDevice(userAgent);

    // Store visitor info in request for later use
    req.visitorInfo = {
      visitorId,
      ipAddress,
      userAgent,
      device
    };
  } catch (error) {
    console.error('Visitor tracking error:', error);
  }
  
  next();
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
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

// ==================== ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// **NEW: Track visitor analytics**
app.post('/api/analytics/track', async (req, res) => {
  try {
    const { page, action, referrer, sessionId } = req.body;
    const { visitorId, ipAddress, userAgent, device } = req.visitorInfo || {};

    if (!visitorId) {
      return res.status(400).json({ success: false, message: 'Visitor info missing' });
    }

    const analyticsEntry = new Analytics({
      visitorId,
      ipAddress,
      userAgent,
      device,
      page: page || '/',
      referrer: referrer || '',
      action: action || 'visit',
      sessionId: sessionId || visitorId,
      timestamp: new Date()
    });

    await analyticsEntry.save();
    
    res.json({ success: true, message: 'Analytics tracked' });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// **UPDATED: Analytics endpoint with real data**
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    console.log('📊 Fetching real analytics data...');
    
    // Get total visits
    const totalVisits = await Analytics.countDocuments({ action: 'visit' });
    
    // Get unique visitors (count distinct visitorIds)
    const uniqueVisitors = await Analytics.distinct('visitorId');
    
    // Get total bookings
    const totalBookings = await Booking.countDocuments();
    
    // Calculate conversion rate
    const conversionRate = uniqueVisitors.length > 0 
      ? ((totalBookings / uniqueVisitors.length) * 100).toFixed(1) + '%'
      : '0%';
    
    // Get total revenue from completed bookings
    const revenueData = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
    
    // Get bookings by status
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const statusCounts = {
      completed: 0,
      accepted: 0,
      pending: 0,
      declined: 0
    };
    bookingsByStatus.forEach(item => {
      statusCounts[item._id] = item.count;
    });
    
    // Get device statistics
    const deviceStats = await Analytics.aggregate([
      { $group: { _id: '$device', count: { $sum: 1 } } }
    ]);
    
    const deviceCounts = { mobile: 0, desktop: 0, tablet: 0 };
    deviceStats.forEach(item => {
      deviceCounts[item._id] = item.count;
    });
    
    // Get top rated porters with actual reviews
    const topPorters = await Review.aggregate([
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
    
    // Get recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('_id passengerName phone station trainNo status totalPrice createdAt')
      .lean();
    
    const analytics = {
      overview: {
        totalVisits: totalVisits,
        uniqueVisitors: uniqueVisitors.length,
        totalBookings: totalBookings,
        conversionRate: conversionRate,
        totalRevenue: totalRevenue
      },
      bookingsByStatus: statusCounts,
      deviceStats: deviceCounts,
      topPorters: topPorters.map(porter => ({
        _id: porter._id,
        porterName: porter.porterName,
        avgRating: parseFloat(porter.avgRating.toFixed(1)),
        totalReviews: porter.totalReviews
      })),
      recentBookings: recentBookings.map(booking => ({
        id: booking._id.toString().substring(0, 8),
        passengerName: booking.passengerName,
        phone: booking.phone,
        station: booking.station,
        trainNo: booking.trainNo,
        status: booking.status,
        totalPrice: booking.totalPrice,
        requestedAt: booking.createdAt
      }))
    };
    
    console.log('✅ Real analytics data fetched successfully');
    console.log(`   Total Visits: ${totalVisits}`);
    console.log(`   Unique Visitors: ${uniqueVisitors.length}`);
    console.log(`   Total Bookings: ${totalBookings}`);
    console.log(`   Conversion Rate: ${conversionRate}`);
    
    res.json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    console.error('❌ Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data',
      error: error.message
    });
  }
});

// Debug endpoint to check specific porter
app.get('/api/porter/debug/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const porter = await Porter.findOne({
      $or: [{ phone: identifier }, { badgeNumber: identifier }]
    });
    
    if (!porter) {
      return res.json({
        success: false,
        message: 'Porter not found',
        identifier: identifier
      });
    }
    
    res.json({
      success: true,
      porter: {
        name: porter.name,
        phone: porter.phone,
        badgeNumber: porter.badgeNumber,
        station: porter.station,
        isOnline: porter.isOnline,
        isVerified: porter.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to check porter online status
app.get('/api/porters/debug', async (req, res) => {
  try {
    const allPorters = await Porter.find({})
      .select('name phone badgeNumber station isOnline isVerified lastSeen')
      .lean();
    
    const onlinePorters = allPorters.filter(p => p.isOnline);
    
    res.json({
      success: true,
      total: allPorters.length,
      online: onlinePorters.length,
      offline: allPorters.length - onlinePorters.length,
      porters: allPorters.map(p => ({
        _id: p._id,
        name: p.name,
        phone: p.phone,
        badgeNumber: p.badgeNumber,
        station: p.station,
        isOnline: p.isOnline,
        isVerified: p.isVerified,
        lastSeen: p.lastSeen
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register Porter
app.post('/api/porter/register', upload.single('image'), async (req, res) => {
  try {
    const { name, phone, badgeNumber, station, password } = req.body;

    console.log('📝 Registration attempt:', { name, phone, badgeNumber, station });

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
      const filePath = path.join(__dirname, 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
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
    console.log('✅ Porter saved to database');

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
    console.error('❌ Registration Error:', error);
    
    if (req.file) {
      const filePath = path.join(__dirname, 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
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
    const { phone, badgeNumber, password } = req.body;

    const loginField = phone || badgeNumber;
    const loginType = phone ? 'mobile' : 'badge';

    console.log(`🔐 Login attempt for ${loginType}:`, loginField);

    if (!loginField || !password) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number (or badge number) and password are required'
      });
    }

    if (phone && !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number'
      });
    }

    let porter = null;
    
    if (phone) {
      porter = await Porter.findOne({ phone: loginField });
    }
    
    if (!porter) {
      porter = await Porter.findOne({ badgeNumber: loginField });
    }

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

    console.log(`✅ Login successful - Porter ${porter.name} is now ONLINE`);

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
    console.error('❌ Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// Get Porter Profile
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

// Get available porters
app.get('/api/porters/available', async (req, res) => {
  try {
    const { station } = req.query;
    
    let query = { isOnline: true, isVerified: true };
    if (station) {
      query.station = { $regex: new RegExp(`^${station}$`, 'i') };
    }

    const porters = await Porter.find(query)
      .select('-password')
      .sort({ rating: -1, totalTrips: -1 });

    console.log(`✅ Found ${porters.length} online porters`);

    res.json({
      success: true,
      count: porters.length,
      data: porters.map(porter => ({
        id: porter.badgeNumber,
        _id: porter._id.toString(),
        mongoId: porter._id.toString(),
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
    console.error('❌ Fetch Available Porters Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      count: 0,
      data: [],
      error: error.message
    });
  }
});

// Update porter status
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

    console.log(`📡 Porter ${porter.name} status updated to ${isOnline ? 'ONLINE' : 'OFFLINE'}`);

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

// Get notifications
app.get('/api/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    if (type === 'porter') {
      const porter = await Porter.findOne({
        $or: [{ _id: id }, { badgeNumber: id }]
      });

      if (!porter) {
        return res.json({
          success: true,
          count: 0,
          data: []
        });
      }

      const notifications = await Booking.find({
        porterId: porter._id.toString(),
        status: 'pending'
      }).sort({ createdAt: -1 }).limit(50);

      res.json({
        success: true,
        count: notifications.length,
        data: notifications || []
      });
    } else {
      res.json({
        success: true,
        count: 0,
        data: []
      });
    }

  } catch (error) {
    console.error('❌ Fetch Notifications Error:', error);
    res.status(200).json({
      success: false,
      message: 'Error fetching notifications',
      count: 0,
      data: [],
      error: error.message
    });
  }
});

// Create Booking
app.post('/api/bookings', async (req, res) => {
  try {
    const bookingData = req.body;
    
    const porter = await Porter.findOne({ 
      $or: [
        { badgeNumber: bookingData.porterId },
        { _id: bookingData.porterId }
      ]
    });

    if (!porter) {
      return res.status(404).json({
        success: false,
        message: 'Porter not found'
      });
    }

    if (!porter.isOnline) {
      return res.status(400).json({
        success: false,
        message: 'Porter is currently offline'
      });
    }

    bookingData.porterId = porter._id.toString();
    bookingData.porterBadgeNumber = porter.badgeNumber;
    
    const booking = new Booking(bookingData);
    await booking.save();

    // Track booking analytics
    if (req.visitorInfo) {
      const analyticsEntry = new Analytics({
        ...req.visitorInfo,
        action: 'booking',
        page: '/booking',
        timestamp: new Date()
      });
      await analyticsEntry.save();
    }

    console.log(`✅ Booking created: ${booking._id}`);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: booking._id.toString(),
        ...booking.toObject()
      }
    });

  } catch (error) {
    console.error('❌ Create Booking Error:', error);
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

    const porter = await Porter.findOne({
      $or: [{ _id: porterId }, { badgeNumber: porterId }]
    });

    if (!porter) {
      return res.status(404).json({
        success: false,
        message: 'Porter not found'
      });
    }

    let query = { porterId: porter._id.toString() };
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

// Get bookings by phone
app.get('/api/bookings/phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }
    
    const bookings = await Booking.find({ phone: phone })
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`✅ Found ${bookings.length} bookings for phone ${phone}`);
    
    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
    
  } catch (error) {
    console.error('❌ Fetch Bookings by Phone Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update booking status
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

    console.log(`📋 Booking ${id} status updated to ${status}`);

    if (status === 'completed') {
      const porter = await Porter.findById(booking.porterId);
      if (porter) {
        porter.totalTrips += 1;
        await porter.save();
        console.log(`✅ Porter ${porter.name} total trips: ${porter.totalTrips}`);
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

    console.log(`⭐ Review submitted: ${reviewData.rating} stars`);

    if (reviewData.porterId && reviewData.porterRating) {
      const porter = await Porter.findOne({
        $or: [
          { badgeNumber: reviewData.porterId },
          { _id: reviewData.porterId }
        ]
      });
      
      if (porter) {
        const reviews = await Review.find({ 
          porterId: { $in: [porter.badgeNumber, porter._id.toString()] }
        });
        const totalRating = reviews.reduce((sum, r) => sum + r.porterRating, 0);
        porter.rating = parseFloat((totalRating / reviews.length).toFixed(1));
        await porter.save();
        console.log(`✅ Porter ${porter.name} new rating: ${porter.rating}`);
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

// Admin endpoint to delete porter
app.delete('/api/admin/porter/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Admin attempting to delete porter: ${id}`);
    
    const porter = await Porter.findById(id);
    if (!porter) {
      return res.status(404).json({
        success: false,
        message: 'Porter not found'
      });
    }
    
    await Porter.findByIdAndDelete(id);
    
    console.log(`✅ Porter ${porter.name} deleted successfully`);
    
    res.json({
      success: true,
      message: 'Porter deleted successfully',
      deletedPorter: {
        name: porter.name,
        badgeNumber: porter.badgeNumber,
        phone: porter.phone
      }
    });
    
  } catch (error) {
    console.error('❌ Delete Porter Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during deletion',
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
  console.log(`📊 Debug endpoint: http://localhost:${PORT}/api/porters/debug`);
  console.log(`📈 Analytics tracking enabled`);
});
