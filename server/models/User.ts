import mongoose, { Schema, Document } from 'mongoose';

export interface ITypingTest {
  wpm: number;
  accuracy: number;
  date: Date;
}

export interface IUser extends Document {
  name: string;
  password: string;
  createdAt: Date;
  typingTests: ITypingTest[];
}

const TypingTestSchema = new Schema<ITypingTest>({
  wpm: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    typingTests: { type: [TypingTestSchema], default: [] },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>('User', UserSchema, 'users');


export default User;

