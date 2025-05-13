import { Router } from 'express';

const router = Router();

router.get('/hello', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

router.get('/bye', (req, res) => {
  res.json({ message: 'Bye from Express!' });
});

export default router;
