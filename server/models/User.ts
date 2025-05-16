import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  password: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>('User', UserSchema, 'users');

export default User;