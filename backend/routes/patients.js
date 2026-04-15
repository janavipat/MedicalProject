import { Router } from 'express';
import Patient from '../models/Patient.js';
import Prescription from '../models/Prescription.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// All patient routes require a valid Firebase token
router.use(verifyToken);

// GET /api/patients — list all patients with last prescription info (newest first)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 500 } = req.query;
    const patients = await Patient.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Patient.countDocuments();

    // Attach last prescription summary per patient via aggregation
    const patientIds = patients.map(p => p._id);
    const lastRx = await Prescription.aggregate([
      { $match: { patientId: { $in: patientIds } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$patientId', diagnosis: { $first: '$diagnosis' }, createdAt: { $first: '$createdAt' } } },
    ]);
    const rxMap = Object.fromEntries(lastRx.map(r => [r._id.toString(), r]));

    const enriched = patients.map(p => ({
      ...p.toObject(),
      lastPrescription: rxMap[p._id.toString()] || null,
    }));

    res.json({ patients: enriched, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// GET /api/patients/search?q= — search by name or contact
router.get('/search', async (req, res) => {
  try {
    const { q = '' } = req.query;
    if (!q.trim()) return res.json([]);
    const patients = await Patient.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { contact: { $regex: q, $options: 'i' } },
      ],
    }).limit(10);
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/patients/:id — single patient with prescriptions
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const prescriptions = await Prescription.find({ patientId: req.params.id })
      .sort({ createdAt: -1 });

    res.json({ ...patient.toObject(), prescriptions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// POST /api/patients — create a new patient
router.post('/', async (req, res) => {
  try {
    const { name, age, contact, gender, address, bloodGroup, weight, medicalHist } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Patient name is required' });
    }

    const patient = new Patient({
      name,
      age:        age ? Number(age) : 0,
      contact:    contact || '',
      gender:     gender || 'Male',
      address:    address || '',
      bloodGroup: bloodGroup || '',
      weight:     weight ? Number(weight) : 0,
      medicalHist,
    });
    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

// PUT /api/patients/:id — update patient details
router.put('/:id', async (req, res) => {
  try {
    const { name, age, contact, gender, address, medicalHist } = req.body;
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { name, age: age ? Number(age) : undefined, contact, gender, address, medicalHist },
      { new: true, runValidators: true }
    );
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// DELETE /api/patients/:id — delete patient and all their data
router.delete('/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    // Cascade delete prescriptions
    await Prescription.deleteMany({ patientId: req.params.id });
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

export default router;
