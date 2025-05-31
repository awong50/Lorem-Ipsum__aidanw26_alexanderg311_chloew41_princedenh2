import mongoose, { Schema, Document } from 'mongoose';

export interface ITypingTest {
  wpm: number;
  accuracy: number;
  time: number;
  date: Date;
}

export interface ILatexResult {
  score: number;
  time: number;
  skipped: number;
  shownSolutions: number;
  totalQuestions: number;
  date: Date;
}

export interface IUser extends Document {
  name: string;
  password: string;
  createdAt: Date;
  typingTests: ITypingTest[];
  latexResults: ILatexResult[];
}

const TypingTestSchema = new Schema<ITypingTest>({
  wpm: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  time: { type: Number, required: true }, 
  date: { type: Date, default: Date.now },
});

const LatexResultSchema = new Schema<ILatexResult>({
  score:           { type: Number, required: true },
  time:            { type: Number, required: true },
  skipped:         { type: Number, required: true },
  shownSolutions:  { type: Number, required: true },
  totalQuestions:  { type: Number, required: true },
  date:            { type: Date, default: Date.now },
});

const UserSchema: Schema = new Schema(
  {
    name:        { type: String, required: true },
    password:    { type: String, required: true },
    typingTests: { type: [TypingTestSchema], default: [] },
    latexResults: { type: [LatexResultSchema], default: [] },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>('User', UserSchema, 'users');
export default User;
