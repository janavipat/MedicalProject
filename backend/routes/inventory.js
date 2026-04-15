import { Router } from 'express';
import Inventory from '../models/Inventory.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

// GET /api/inventory — all medicines (alphabetical)
router.get('/', async (req, res) => {
  try {
    const medicines = await Inventory.find().sort({ medicineName: 1 });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// GET /api/inventory/search?q= — autocomplete search
router.get('/search', async (req, res) => {
  try {
    const { q = '' } = req.query;
    if (!q.trim()) return res.json([]);
    const medicines = await Inventory.find({
      medicineName: { $regex: q, $options: 'i' },
    }).limit(10);
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: 'Medicine search failed' });
  }
});

// GET /api/inventory/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Medicine not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch medicine' });
  }
});

// POST /api/inventory — add a new medicine
router.post('/', async (req, res) => {
  try {
    const { medicineName, brand, formulation, stockQuantity, price, expiryDate, lowStockThreshold } = req.body;

    if (!medicineName || stockQuantity == null || price == null) {
      return res.status(400).json({ error: 'medicineName, stockQuantity, and price are required' });
    }

    const item = new Inventory({ medicineName, brand, formulation, stockQuantity, price, expiryDate, lowStockThreshold });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add medicine' });
  }
});

// PUT /api/inventory/:id — update medicine details or stock
router.put('/:id', async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ error: 'Medicine not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update medicine' });
  }
});

// PATCH /api/inventory/:id/consume — decrement stock by a quantity
router.patch('/:id/consume', async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Medicine not found' });
    if (item.stockQuantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }
    item.stockQuantity -= Number(quantity);
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to consume stock' });
  }
});

// DELETE /api/inventory/:id
router.delete('/:id', async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Medicine not found' });
    res.json({ message: 'Medicine deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete medicine' });
  }
});

export default router;
