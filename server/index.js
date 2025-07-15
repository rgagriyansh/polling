const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const mongoose = require('mongoose');

const connectDB = require('./config/database');
const Poll = require('./models/Poll');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Serve static files (only in production)
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '../client/build');
  if (require('fs').existsSync(staticPath)) {
    app.use(express.static(staticPath));
  }
}

// Active connections for Socket.IO
const activeConnections = new Map();

// Poll types
const POLL_TYPES = {
  MCQ: 'mcq',
  RATING: 'rating',
  YES_NO: 'yes_no',
  OPEN_TEXT: 'open_text'
};

// Create a new poll
app.post('/api/polls', async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { title, description, questions, settings } = req.body;
    
    const poll = new Poll({
      title,
      description,
      questions: questions.map(q => ({
        ...q,
        id: uuidv4(),
        responses: [],
        results: {}
      })),
      settings: {
        allowMultipleVotes: false,
        showResults: true,
        expirationTime: null,
        ...settings
      }
    });

    await poll.save();
    
    res.json({
      success: true,
      pollId: poll._id,
      pollLink: `${req.protocol}://${req.get('host')}/poll/${poll._id}`,
      adminLink: `${req.protocol}://${req.get('host')}/admin/${poll._id}`
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

// Get all polls
app.get('/api/polls', async (req, res) => {
  try {
    const polls = await Poll.find({}, {
      _id: 1,
      title: 1,
      description: 1,
      createdAt: 1,
      totalVotes: 1,
      'questions': 1,
      isActive: 1
    }).sort({ createdAt: -1 });
    
    res.json(polls);
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
});

// Get poll data
app.get('/api/polls/:pollId', async (req, res) => {
  try {
    const { pollId } = req.params;
    const poll = await Poll.findById(pollId);
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    res.json(poll);
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ error: 'Failed to fetch poll' });
  }
});

// Submit a vote
app.post('/api/polls/:pollId/vote', async (req, res) => {
  try {
    const { pollId } = req.params;
    const { questionId, answer, voterId } = req.body;
    
    const poll = await Poll.findById(pollId);
    if (!poll || !poll.isActive) {
      return res.status(404).json({ error: 'Poll not found or inactive' });
    }
    
    const question = poll.questions.find(q => q.id === questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Add response
    const response = {
      id: uuidv4(),
      questionId,
      answer,
      voterId: voterId || uuidv4(),
      timestamp: moment().toISOString()
    };
    
    question.responses.push(response);
    
    // Update results
    poll.updateResults();
    
    await poll.save();
    
    // Emit real-time update
    io.to(pollId).emit('pollUpdate', {
      pollId,
      questionId,
      results: question.results,
      totalVotes: poll.totalVotes
    });
    
    res.json({ success: true, responseId: response.id });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

// Get poll results
app.get('/api/polls/:pollId/results', async (req, res) => {
  try {
    const { pollId } = req.params;
    const poll = await Poll.findById(pollId);
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    res.json({
      pollId: poll._id,
      title: poll.title,
      questions: poll.questions.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        results: q.results,
        totalResponses: q.responses.length
      })),
      totalVotes: poll.totalVotes,
      createdAt: poll.createdAt
    });
  } catch (error) {
    console.error('Error fetching poll results:', error);
    res.status(500).json({ error: 'Failed to fetch poll results' });
  }
});

// Export results as CSV
app.get('/api/polls/:pollId/export/csv', async (req, res) => {
  try {
    const { pollId } = req.params;
    const poll = await Poll.findById(pollId);
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    const csvData = generateCSV(poll);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=poll-${pollId}-${moment().format('YYYY-MM-DD')}.csv`);
    res.send(csvData);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('joinPoll', (pollId) => {
    socket.join(pollId);
    activeConnections.set(socket.id, pollId);
    console.log(`User ${socket.id} joined poll ${pollId}`);
  });
  
  socket.on('leavePoll', (pollId) => {
    socket.leave(pollId);
    activeConnections.delete(socket.id);
    console.log(`User ${socket.id} left poll ${pollId}`);
  });
  
  socket.on('disconnect', () => {
    const pollId = activeConnections.get(socket.id);
    if (pollId) {
      socket.leave(pollId);
      activeConnections.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});



function generateCSV(poll) {
  let csv = 'Question,Answer,Voter ID,Timestamp\n';
  
  poll.questions.forEach(question => {
    question.responses.forEach(response => {
      csv += `"${question.text}","${response.answer}","${response.voterId}","${response.timestamp}"\n`;
    });
  });
  
  return csv;
}

// Serve React app for client-side routes
// This handles routes like /poll/:pollId, /admin, etc.
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Skip Socket.IO routes
  if (req.path.startsWith('/socket.io/')) {
    return res.status(404).json({ error: 'Socket.IO endpoint not found' });
  }
  
  // Skip health check
  if (req.path === '/health') {
    return res.status(404).json({ error: 'Health endpoint not found' });
  }
  
  // In production, serve the built React app
  if (process.env.NODE_ENV === 'production') {
    const indexPath = path.join(__dirname, '../client/build/index.html');
    console.log('Looking for React app at:', indexPath);
    if (require('fs').existsSync(indexPath)) {
      console.log('Serving React app from:', indexPath);
      res.sendFile(indexPath);
    } else {
      console.log('React app not found at:', indexPath);
      res.status(404).json({ 
        error: 'React app not built. Please run npm run build first.',
        path: indexPath,
        exists: require('fs').existsSync(path.dirname(indexPath))
      });
    }
  } else {
    // In development, redirect to React dev server
    res.redirect(`http://localhost:3000${req.path}`);
  }
});

const PORT = process.env.PORT || 5001;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    const dbConnected = await connectDB();
    
    if (!dbConnected) {
      console.log('Starting server without database connection...');
      console.log('API endpoints will not work without MongoDB connection');
    }
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      if (process.env.NODE_ENV === 'production') {
        console.log(`Admin panel: http://localhost:${PORT}/admin`);
        console.log(`Poll links: http://localhost:${PORT}/poll/{pollId}`);
      } else {
        console.log(`React dev server should be running on http://localhost:3000`);
        console.log(`Admin panel: http://localhost:3000/admin`);
        console.log(`Poll links: http://localhost:3000/poll/{pollId}`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 
