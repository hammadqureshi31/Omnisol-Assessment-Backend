import { createServer } from 'http';
import dotenv from 'dotenv';
import { app } from './app.js';
import { connectDB } from './DB.js';
import { setSocket } from './socket.js';

dotenv.config({ path: './.env' });

const server = createServer(app);
connectDB();

setSocket(server, app);

server.listen(process.env.PORT, () => {
  console.log(`Server is listening on port: ${process.env.PORT}`);
});
