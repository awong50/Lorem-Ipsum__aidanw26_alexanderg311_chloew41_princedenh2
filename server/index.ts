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

app.use(cors({
  origin: 'https://prototype.awong50.tech',
  credentials: true,
}));

app.use(express.json());

app.use(
  session({
    secret: 'supasecretkeyhehe',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  })
);
// API Routes
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});