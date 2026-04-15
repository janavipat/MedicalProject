import { Router } from 'express';
import Disease from '../models/Disease.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

// GET /api/diseases — all diseases
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q ? { name: { $regex: q, $options: 'i' } } : {};
    const diseases = await Disease.find(filter).sort({ name: 1 });
    res.json(diseases);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch diseases' });
  }
});

// GET /api/diseases/:id
router.get('/:id', async (req, res) => {
  try {
    const d = await Disease.findById(req.params.id);
    if (!d) return res.status(404).json({ error: 'Disease not found' });
    res.json(d);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch disease' });
  }
});

// POST /api/diseases — add new disease protocol
router.post('/', async (req, res) => {
  try {
    const d = new Disease(req.body);
    await d.save();
    res.status(201).json(d);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Disease already exists' });
    res.status(500).json({ error: 'Failed to add disease' });
  }
});

// PUT /api/diseases/:id — update disease
router.put('/:id', async (req, res) => {
  try {
    const d = await Disease.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!d) return res.status(404).json({ error: 'Disease not found' });
    res.json(d);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update disease' });
  }
});

// DELETE /api/diseases/:id
router.delete('/:id', async (req, res) => {
  try {
    const d = await Disease.findByIdAndDelete(req.params.id);
    if (!d) return res.status(404).json({ error: 'Disease not found' });
    res.json({ message: 'Disease deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete disease' });
  }
});

export default router;
