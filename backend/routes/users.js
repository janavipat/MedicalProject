import { Router } from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

// POST /api/users — create or update user profile (called on signup)
router.post('/', async (req, res) => {
  try {
    const { name, role } = req.body;
    const { uid, email } = req.user;

    if (!name || !role) {
      return res.status(400).json({ error: 'name and role are required' });
    }

    const user = await User.findOneAndUpdate(
      { uid },
      { uid, name, email: email || '', role },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(user);
  } catch (err) {
    console.error('Error saving user profile:', err);
    res.status(500).json({ error: 'Failed to save user profile' });
  }
});

// GET /api/users/me — get current logged-in user's profile + role
router.get('/me', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(404).json({ error: 'User profile not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// GET /api/users — list all staff (Admin only, future use)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
