import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import connectDB from './db/mongoose';
import apiRouter from './routes/api';

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

const allowedOrigins = [
  'https://prototype.awong50.tech',
  'http://localhost:5173',
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

app.use(
  session({
    secret: 'supasecretkeyhehe',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true, sameSite: 'none' }
  })
);
// API Routes
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});