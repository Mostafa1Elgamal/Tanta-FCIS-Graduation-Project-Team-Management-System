const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

// Create server FIRST
console.log("PORT from env:", process.env.PORT);

const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.set('io', io);

// Connect DB THEN start server (مرة واحدة بس)
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("DB connection failed:", err);
  });