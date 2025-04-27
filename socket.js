import { Server } from 'socket.io';

// Messaging socket setup
export const setSocket = (server, app) => {
  const io = new Server(server, {
    cors: {
      origin: ['https://omni-sol-assessment-frontend.vercel.app'], 
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Set the io instance on the app
  app.set('io', io);

  io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};
