import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { WebSocketServer } from 'ws';
import connectDB from './db/mongoose';
import apiRouter from './routes/api';
import { setupWebSocketServer } from './websocket';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.set('trust proxy', 1);

setupWebSocketServer(wss);

const PORT = process.env.PORT || 3000;  

connectDB();

const allowedOrigins = [
  'https://prototype.awong50.tech',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json());

app.use(session({
  secret: 'supasecretkeyhehe',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'none'
  }
}));


app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
