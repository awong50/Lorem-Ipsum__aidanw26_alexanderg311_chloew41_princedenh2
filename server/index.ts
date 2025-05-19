import express from 'express';
import cors from 'cors';
import path from 'path';
import connectDB from './db/mongoose';
import apiRouter from './routes/api';

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Serve static files
app.use(express.static(path.join(__dirname, '../dist')));

// Wildcard route (must be last)
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});