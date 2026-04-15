import { Router } from 'express';
import Prescription from '../models/Prescription.js';
import Patient from '../models/Patient.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

// GET /api/prescriptions — all prescriptions with patient info
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, patientId } = req.query;
    const filter = patientId ? { patientId } : {};
    const prescriptions = await Prescription.find(filter)
      .populate('patientId', 'name age gender contact')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// GET /api/prescriptions/:id
router.get('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId', 'name age gender contact address');
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
    res.json(prescription);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
});

// POST /api/prescriptions — create a new prescription
router.post('/', async (req, res) => {
  try {
    const { patientId, patientName, diagnosis, medicines, pathya, apathya, notes } = req.body;

    if (!medicines || medicines.length === 0) {
      return res.status(400).json({ error: 'At least one medicine is required' });
    }

    let resolvedPatientId = patientId;

    // Verify the patient exists; if not, find or create by name
    if (resolvedPatientId) {
      const exists = await Patient.findById(resolvedPatientId).catch(() => null);
      if (!exists) resolvedPatientId = null; // fall through to search/create
    }

    if (!resolvedPatientId) {
      if (!patientName) {
        return res.status(400).json({ error: 'patientId or patientName is required' });
      }
      // Search by name
      const found = await Patient.findOne({ name: { $regex: `^${patientName.trim()}$`, $options: 'i' } });
      if (found) {
        resolvedPatientId = found._id;
      } else {
        // Auto-create a minimal patient record
        const newPatient = await Patient.create({ name: patientName.trim() });
        resolvedPatientId = newPatient._id;
      }
    }

    const prescription = new Prescription({ patientId: resolvedPatientId, diagnosis, medicines, pathya, apathya, notes });
    await prescription.save();

    res.status(201).json(prescription);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

// PUT /api/prescriptions/:id — update prescription
router.put('/:id', async (req, res) => {
  try {
    const { diagnosis, medicines, pathya, apathya, notes } = req.body;
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { diagnosis, medicines, pathya, apathya, notes },
      { new: true, runValidators: true }
    );
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
    res.json(prescription);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update prescription' });
  }
});

// DELETE /api/prescriptions/:id
router.delete('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndDelete(req.params.id);
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
    res.json({ message: 'Prescription deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete prescription' });
  }
});

export default router;
