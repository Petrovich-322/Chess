import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = 3000;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

let field = null;

app.use(cors());

app.get('/api/new-game', (req, res) => {
    res.json({text: '322'});
})

io.on('connection', (socket) => {
  console.log('------New connection------');
//   socket.emit('receiveField', {field: field});
  socket.on('changeField', (data) => {
    const newField = data.field;
    socket.broadcast.emit('receiveField', {field: newField});
  })
})

httpServer.listen(PORT, '127.0.0.1', () => {
    console.log(`Local: http://localhost:${PORT}`);
})