// server.js - CooliMate Backend Server
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ==================== MONGODB CONNECTION WITH RETRY LOGIC ====================
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coolimate', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    });

    console.log('✅ MongoDB Connected Successfully');
    console.log(`📍 Database Host: ${conn.connection.host}`);
    console.log(`📦 Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};

// Initial connection
connectDB();

// Handle connection events
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

// Middleware to check DB connection before processing requests
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.log('⚠️ Database not ready, readyState:', mongoose.connection.readyState);
    return res.status(503).json({ 
      error: 'Database temporarily unavailable',
      message: 'Please try again in a moment',
      readyState: mongoose.connection.readyState
    });
  }
  next();
});

// ==================== BOOKING SCHEMA ====================
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

// ==================== ROUTES ====================

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

// 1. CREATE - Passenger creates a new booking request
app.post('/api/bookings', async (req, res) => {
  try {
    const bookingData = req.body;
    
    // Validate required fields
    if (!bookingData.porterId || !bookingData.passengerName) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['porterId', 'passengerName', 'phone', 'pnr']
      });
    }

    // Generate unique booking ID if not provided
    if (!bookingData.id) {
      bookingData.id = `BK${Date.now()}`;
    }

    const booking = new Booking(bookingData);
    await booking.save();

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

// 2. READ - Get all bookings for a specific porter
app.get('/api/bookings/porter/:porterId', async (req, res) => {
  try {
    const { porterId } = req.params;
    const { status } = req.query; // Optional: filter by status

    const query = { 
      porterId,
      status: { $ne: 'declined' } // Exclude declined bookings by default
    };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ requestedAt: -1 }) // Most recent first
      .maxTimeMS(20000); // 20 second timeout for this query

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

// 3. READ - Get a specific booking by ID
app.get('/api/bookings/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findOne({ id: bookingId })
      .maxTimeMS(10000); // 10 second timeout

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

// 4. UPDATE - Porter accepts a booking
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

// 5. UPDATE - Porter completes a booking
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

// 6. UPDATE - Porter declines a booking
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

// 7. GET - Porter statistics
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

// 8. DELETE - Delete a booking (admin only - for testing)
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CooliMate Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`⏳ MongoDB connection status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
});