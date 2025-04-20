const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const compositionRoutes = require('./routes/compositionRoutes');
const socketHandler = require('./socket');

dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'https://HarshitNagpal29.github.io',
    methods: ['GET', 'POST']
  }
});

// Socket handling
socketHandler(io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/compositions', compositionRoutes);
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Start server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});