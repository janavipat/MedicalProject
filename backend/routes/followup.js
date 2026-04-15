import { Router } from 'express';
import FollowUp from '../models/FollowUp.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

// GET /api/followup — list with optional filter
router.get('/', async (req, res) => {
  try {
    const { filter, patientId } = req.query;
    const query = {};
    const now = new Date();

    if (patientId) query.patientId = patientId;

    if (filter === 'today') {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setHours(23, 59, 59, 999);
      query.dueDate = { $gte: start, $lte: end };
    } else if (filter === 'week') {
      const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      query.dueDate = { $gte: now, $lte: end };
    } else if (filter === 'overdue') {
      query.dueDate = { $lt: now };
      query.status = { $nin: ['Completed'] };
    }

    const followUps = await FollowUp.find(query).sort({ dueDate: 1 });
    res.json(followUps);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch follow-ups' });
  }
});

// GET /api/followup/:id
router.get('/:id', async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);
    if (!followUp) return res.status(404).json({ error: 'Follow-up not found' });
    res.json(followUp);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch follow-up' });
  }
});

// POST /api/followup — create a follow-up reminder
router.post('/', async (req, res) => {
  try {
    const { patientId, patientName, contact, diagnosis, dueDate, notes } = req.body;

    if (!patientId || !patientName || !contact || !dueDate) {
      return res.status(400).json({ error: 'patientId, patientName, contact, and dueDate are required' });
    }

    const followUp = new FollowUp({ patientId, patientName, contact, diagnosis, dueDate, notes });
    await followUp.save();
    res.status(201).json(followUp);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create follow-up' });
  }
});

// PUT /api/followup/:id — update status or date
router.put('/:id', async (req, res) => {
  try {
    const followUp = await FollowUp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!followUp) return res.status(404).json({ error: 'Follow-up not found' });
    res.json(followUp);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update follow-up' });
  }
});

// DELETE /api/followup/:id
router.delete('/:id', async (req, res) => {
  try {
    const followUp = await FollowUp.findByIdAndDelete(req.params.id);
    if (!followUp) return res.status(404).json({ error: 'Follow-up not found' });
    res.json({ message: 'Follow-up deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete follow-up' });
  }
});

export default router;
