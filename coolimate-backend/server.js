// server.js - CooliMate Backend Server (PostgreSQL Version)
const express = require('express');
const { Sequelize, DataTypes, Op } = require('sequelize');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ==================== POSTGRESQL CONNECTION ====================
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/coolimate', {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected Successfully');
    console.log(`📦 Database: ${sequelize.config.database}`);
    
    // Sync all models with database
    await sequelize.sync({ alter: true }); // Use { force: true } to drop tables on restart
    console.log('✅ Database models synchronized');
  } catch (error) {
    console.error('❌ PostgreSQL Connection Error:', error.message);
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Middleware to check DB connection
app.use((req, res, next) => {
  if (sequelize.connectionManager.pool._count === 0) {
    return res.status(503).json({ 
      error: 'Database temporarily unavailable',
      message: 'Please try again in a moment'
    });
  }
  next();
});

// ==================== MODELS ====================

// Booking Model
const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true
  },
  porterId: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true
  },
  porterName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  passengerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pnr: {
    type: DataTypes.STRING,
    allowNull: false
  },
  station: {
    type: DataTypes.STRING,
    allowNull: false
  },
  trainNo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  trainName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  coachNo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  boardingStation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  boardingStationCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destinationStation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destinationStationCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dateOfJourney: {
    type: DataTypes.STRING,
    allowNull: false
  },
  arrivalTime: {
    type: DataTypes.STRING,
    allowNull: false
  },
  numberOfBags: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  isLateNight: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isPriority: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'completed', 'declined'),
    defaultValue: 'pending',
    index: true
  },
  requestedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  acceptedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  declinedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'bookings'
});

// Visit Model
const Visit = sequelize.define('Visit', {
  sessionId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  userAgent: {
    type: DataTypes.TEXT
  },
  ipAddress: {
    type: DataTypes.STRING
  },
  device: {
    type: DataTypes.STRING
  },
  browser: {
    type: DataTypes.STRING
  },
  os: {
    type: DataTypes.STRING
  },
  location: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  pages: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  firstVisit: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lastVisit: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  totalVisits: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  isBookingCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  bookingId: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'visits'
});

// Review Model
const Review = sequelize.define('Review', {
  bookingId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.STRING
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userPhone: {
    type: DataTypes.STRING
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  experience: {
    type: DataTypes.ENUM('excellent', 'good', 'average', 'poor'),
    allowNull: false
  },
  porterRating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    }
  },
  porterId: {
    type: DataTypes.STRING
  },
  porterName: {
    type: DataTypes.STRING
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isDisplayed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  helpful: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  tableName: 'reviews'
});

// Notification Model
const Notification = sequelize.define('Notification', {
  recipientId: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true
  },
  recipientType: {
    type: DataTypes.ENUM('passenger', 'porter', 'admin'),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('booking_created', 'booking_accepted', 'booking_declined', 'booking_completed', 'review_request', 'payment_received'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  bookingId: {
    type: DataTypes.STRING
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isSoundPlayed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  timestamps: true,
  tableName: 'notifications'
});

// ==================== HELPER FUNCTIONS ====================

async function createNotification(data) {
  try {
    const notification = await Notification.create(data);
    console.log('🔔 Notification created:', notification.type);
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
}

// ==================== BASIC ROUTES ====================

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'OK',
      message: 'CooliMate Backend is running!',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({ 
      status: 'Degraded',
      message: 'CooliMate Backend is running!',
      database: 'disconnected',
      timestamp: new Date().toISOString()
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

    const booking = await Booking.create(bookingData);

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
    
    if (error.name === 'SequelizeUniqueConstraintError') {
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

    const where = { 
      porterId,
      status: { [Op.ne]: 'declined' }
    };

    if (status) {
      where.status = status;
    }

    const bookings = await Booking.findAll({
      where,
      order: [['requestedAt', 'DESC']]
    });

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
    
    const booking = await Booking.findOne({ where: { id: bookingId } });

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

    const booking = await Booking.findOne({ 
      where: { id: bookingId, status: 'pending' } 
    });

    if (!booking) {
      return res.status(404).json({ 
        error: 'Booking not found or already processed'
      });
    }

    await booking.update({ 
      status: 'accepted',
      acceptedAt: new Date()
    });

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

    const booking = await Booking.findOne({ 
      where: { id: bookingId, status: 'accepted' } 
    });

    if (!booking) {
      return res.status(404).json({ 
        error: 'Booking not found or not in accepted state'
      });
    }

    await booking.update({ 
      status: 'completed',
      completedAt: new Date()
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

    const booking = await Booking.findOne({ 
      where: { id: bookingId, status: 'pending' } 
    });

    if (!booking) {
      return res.status(404).json({ 
        error: 'Booking not found or already processed'
      });
    }

    await booking.update({ 
      status: 'declined',
      declinedAt: new Date()
    });

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

    const stats = await Booking.findAll({
      where: { porterId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'completed' THEN \"totalPrice\" ELSE 0 END")), 'totalEarnings']
      ],
      group: ['status'],
      raw: true
    });

    const formattedStats = {
      pending: 0,
      accepted: 0,
      completed: 0,
      totalEarnings: 0
    };

    stats.forEach(stat => {
      formattedStats[stat.status] = parseInt(stat.count);
      if (stat.status === 'completed') {
        formattedStats.totalEarnings = parseFloat(stat.totalEarnings) || 0;
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

    const booking = await Booking.findOne({ where: { id: bookingId } });

    if (!booking) {
      return res.status(404).json({ 
        error: 'Booking not found'
      });
    }

    await booking.destroy();

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

    let visit = await Visit.findOne({ where: { sessionId } });

    if (visit) {
      const pages = visit.pages || [];
      pages.push({
        path: page,
        timestamp: new Date()
      });
      
      await visit.update({
        lastVisit: new Date(),
        totalVisits: visit.totalVisits + 1,
        pages: pages
      });
    } else {
      visit = await Visit.create({
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

    const visit = await Visit.findOne({ where: { sessionId } });
    
    if (visit) {
      await visit.update({ 
        isBookingCompleted: true,
        bookingId: bookingId
      });
    }

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
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const totalVisits = await Visit.count({ where: dateFilter });
    const uniqueVisitors = await Visit.count({ 
      where: { ...dateFilter, totalVisits: 1 } 
    });
    const totalBookings = await Booking.count({ where: dateFilter });
    const conversionRate = totalVisits > 0 
      ? ((totalBookings / totalVisits) * 100).toFixed(2)
      : 0;

    const bookingsByStatus = await Booking.findAll({
      where: dateFilter,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('totalPrice')), 'totalRevenue']
      ],
      group: ['status'],
      raw: true
    });

    const deviceStats = await Visit.findAll({
      where: dateFilter,
      attributes: [
        'device',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['device'],
      raw: true
    });

    const recentBookings = await Booking.findAll({
      where: dateFilter,
      order: [['requestedAt', 'DESC']],
      limit: 10,
      attributes: ['id', 'passengerName', 'phone', 'station', 'trainNo', 'status', 'totalPrice', 'requestedAt']
    });

    const topPorters = await Review.findAll({
      where: { isApproved: true },
      attributes: [
        'porterId',
        'porterName',
        [sequelize.fn('AVG', sequelize.col('porterRating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews']
      ],
      group: ['porterId', 'porterName'],
      order: [[sequelize.literal('avgRating'), 'DESC']],
      limit: 5,
      raw: true
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalVisits,
          uniqueVisitors,
          totalBookings,
          conversionRate: `${conversionRate}%`,
          totalRevenue: bookingsByStatus.reduce((sum, b) => sum + (parseFloat(b.totalRevenue) || 0), 0)
        },
        bookingsByStatus: bookingsByStatus.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {}),
        deviceStats: deviceStats.reduce((acc, item) => {
          acc[item.device || 'unknown'] = parseInt(item.count);
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

    const where = { recipientId };
    if (type) where.recipientType = type;
    if (unreadOnly === 'true') where.isRead = false;

    const notifications = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    const unreadCount = await Notification.count({
      where: { recipientId, isRead: false }
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

    const notification = await Notification.findByPk(notificationId);
    
    if (notification) {
      await notification.update({ isRead: true, isSoundPlayed: true });
    }

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

    await Notification.update(
      { isRead: true, isSoundPlayed: true },
      { where: { recipientId, isRead: false } }
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
      where: { 
        id: reviewData.bookingId,
        status: 'completed'
      }
    });

    if (!booking) {
      return res.status(400).json({ 
        error: 'Booking not found or not completed' 
      });
    }

    const existingReview = await Review.findOne({ 
      where: { bookingId: reviewData.bookingId }
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

    const review = await Review.create(reviewData);

    console.log('⭐ Review created:', review.id);

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
    const reviews = await Review.findAll({
      where: {
        isApproved: true,
        isDisplayed: true,
        rating: { [Op.gte]: 4 }
      },
      order: [['createdAt', 'DESC']],
      limit: 10,
      attributes: ['userName', 'rating', 'comment', 'experience', 'createdAt', 'porterName']
    });

    const avgRatingData = await Review.findOne({
      where: { isApproved: true },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews']
      ],
      raw: true
    });

    res.json({
      success: true,
      reviews,
      stats: avgRatingData || { avgRating: 0, totalReviews: 0 }
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

    const where = {};
    if (status === 'pending') where.isApproved = false;
    if (status === 'approved') where.isApproved = true;
    if (minRating) where.rating = { [Op.gte]: parseInt(minRating) };

    const reviews = await Review.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 100
    });

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

    const review = await Review.findByPk(reviewId);
    
    if (review) {
      await review.update({ isApproved, isDisplayed });
    }

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
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`⏳ PostgreSQL connection status: Checking...`);
  console.log(`\n📊 Available Features:`);
  console.log(`   - Analytics Dashboard: GET /api/analytics/dashboard`);
  console.log(`   - Notifications: GET /api/notifications/:recipientId`);
  console.log(`   - Reviews: GET /api/reviews/public`);
  console.log(`   - Visit Tracking: POST /api/analytics/visit`);
});