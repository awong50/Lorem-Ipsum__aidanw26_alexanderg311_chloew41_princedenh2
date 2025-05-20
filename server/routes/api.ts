import { Router } from 'express';
import User from '../models/User';
import userQuery from '../db/userQuery';

const router = Router();

// Create a new user
router.post('/users', async (req, res) => {
  try {
    const { name,  password } = req.body;
    const user = new User({ name,  password });
    const currentUser = userQuery(name)
    
    if (currentUser == null) {
      await user.save();
      res.status(201).json(user);
      console.log('Current User')
      console.log(currentUser)
    }
    else {
      res.status(400).json({error: 'Username Already Exists'});
    }

  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
});

// Get all users
router.get('/users', async (_req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

// Validate one user
router.get('/validateUser', async (_req, res) => {
  const userInfo = userQuery
  res.json(userQuery)
});

export default router;