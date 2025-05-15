import mongoose from 'mongoose';
import User from '../models/User';

const user_query = async (str:
     username) => {
const t = User;
const users = await t.findOne({name: username});


}
