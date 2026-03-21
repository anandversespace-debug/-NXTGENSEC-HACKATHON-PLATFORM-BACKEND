const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        process.env.FRONTEND_URL
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[REALTIME] Connection established: ${socket.id}`);

    socket.on('join_team', (teamId) => {
      socket.join(`team_${teamId}`);
      console.log(`[REALTIME] ${socket.id} joined team cell: ${teamId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[REALTIME] Disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket instance not initialized.');
  }
  return io;
};

module.exports = { initSocket, getIO };
