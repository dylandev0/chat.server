import { Server, Socket } from 'socket.io';

export const createSockerIO = (server: any) => {
  const io = new Server(server, {
    path: '/server-chat/socket.io', // New path for Socket.IO
    cors: {
      origin: process.env.FE_URL ? process.env.FE_URL.split(',') : '*', // Allow requests from this origin and my frontend port = 5173
      methods: ['GET', 'POST'], // Allow these HTTP methods
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('A user connected', socket.id);
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });

    socket.on('send_message', data => {
      // Emit the received message data to all connected clients
      io.emit('receive_message', data);
    });
  });
};
