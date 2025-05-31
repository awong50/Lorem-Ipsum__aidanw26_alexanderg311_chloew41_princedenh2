import { Router } from 'express';
import User from '../models/User';
import userQuery from '../db/userQuery';
import RandomWords from '../data/RandomWords';
import { random } from 'lodash';
const router = Router();

// Create a new user
router.post('/users', async (req, res) => {
  try {
    const { name,  password } = req.body;
    const user = new User({ name,  password });
    const currentUser = await userQuery(name);
    
    if (currentUser == null) {
      await user.save();
      res.status(201).json(user);
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
router.get('/words', async (_req, res) => {
  try {
     res.json(RandomWords());
    
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
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
});

router.post('/typing-result', async (req, res) => {
  try {
    const { username, wpm, accuracy } = req.body;
    const user = await User.findOne({ name: username });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    user.typingTests = user.typingTests || [];
    user.typingTests.push({ wpm, accuracy, date: new Date() });

    // Keep only last 10 results
    if (user.typingTests.length > 10) {
      user.typingTests = user.typingTests.slice(-10);
    }

    await user.save();
    res.status(200).json({ message: 'Typing result saved' });
  } catch (error) {
    console.error(error); // Add this for debugging
    res.status(500).json({ error: 'Failed to save result' });
  }
});

router.get('/typing-history/:username', async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.username });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(user.typingTests);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving history' });
  }
});

// Save a new LaTeX result
router.post('/latex-results', async (req, res) => {
  try {
    const { username, score, time } = req.body;

    if (!username || score == null || time == null) {
      res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findOne({ name: username });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.latexResults = user.latexResults || [];
    user.latexResults.push({ score, time, date: new Date() });

    // Keep only latest 10 results if needed
    if (user.latexResults.length > 10) {
      user.latexResults = user.latexResults.slice(-10);
    }

    await user.save();
    res.status(201).json({ message: 'Result saved', latexResults: user.latexResults });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save result' });
  }
});

router.get('/latex-results/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ name: username });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(user.latexResults);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});


export default router;