import mongoose from 'mongoose';

const LatexResultSchema = new mongoose.Schema({
  username: { type: String, required: true },
  score: { type: Number, required: true },
  time: { type: Number, required: true }, // seconds
  createdAt: { type: Date, default: Date.now }
});

const LatexResult = mongoose.model('LatexResult', LatexResultSchema);

export default LatexResult;
