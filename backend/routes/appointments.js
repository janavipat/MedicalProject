import { Router } from 'express';
import Appointment from '../models/Appointment.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

// GET /api/appointments — list appointments with flexible date filtering
// Supports: ?date=YYYY-MM-DD (single day) OR ?startDate=...&endDate=... (range) OR ?status=
router.get('/', async (req, res) => {
  try {
    const { date, startDate, endDate, status, patientId, page = 1, limit = 500 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (patientId) filter.patientId = patientId;

    if (startDate || endDate) {
      const s = new Date(startDate || endDate);
      s.setHours(0, 0, 0, 0);
      const e = new Date(endDate || startDate);
      e.setHours(23, 59, 59, 999);
      filter.date = { $gte: s, $lte: e };
    } else if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(filter)
      .sort({ date: 1, tokenNumber: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Appointment.countDocuments(filter);
    res.json({ appointments, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// GET /api/appointments/today — shortcut for today's queue
router.get('/today', async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({ date: { $gte: start, $lte: end } })
      .sort({ tokenNumber: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch today\'s appointments' });
  }
});

// GET /api/appointments/:id
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// POST /api/appointments — book a new appointment
router.post('/', async (req, res) => {
  try {
    const { patientId, patientName, date, time, reason, notes, isEmergency, gender, age, bloodGroup, weight, address } = req.body;

    if (!patientId || !patientName || !date) {
      return res.status(400).json({ error: 'patientId, patientName, and date are required' });
    }

    // Auto-assign the next token for that day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const lastToken = await Appointment.findOne({ date: { $gte: dayStart, $lte: dayEnd } })
      .sort({ tokenNumber: -1 });
    const tokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

    const appointment = new Appointment({
      patientId, patientName, date, time, reason, notes, tokenNumber, isEmergency: !!isEmergency,
      gender: gender || 'Male',
      age: age ? Number(age) : null,
      bloodGroup: bloodGroup || '',
      weight: weight ? Number(weight) : null,
      address: address || '',
    });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// PUT /api/appointments/:id — update appointment (reschedule, change status)
router.put('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

export default router;
