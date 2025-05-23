import { Router } from 'express';
import User from '../models/User';
import userQuery from '../db/userQuery';

const router = Router();

// Create a new user
router.post('/users', async (req, res) => {
  try {
    const { name,  password } = req.body;
    console.log(name);
    const user = new User({ name,  password });
    const currentUser = await userQuery(name);

    console.log(currentUser);
    
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

// Login route
router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findOne({ name });
    if (!user) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }
    // Simple password check (for demo; use hashing in production)
    if (user.password !== password) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }
    // Don't send password back
    const userObj = { name: user.name, createdAt: user.createdAt };
    res.json({ user: userObj });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
    return;
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.clearCookie('connect  .sid'); // Clear the session cookie
    res.json({ message: 'Logout successful' });
  });
});

export default router;