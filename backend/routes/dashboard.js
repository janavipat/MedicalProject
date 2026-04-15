import { Router } from 'express';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import Inventory from '../models/Inventory.js';
import Billing from '../models/Billing.js';
import Disease from '../models/Disease.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

// Helper: build a start/end date range (default = today)
function buildRange(start, end) {
  const s = start ? new Date(start) : new Date();
  s.setHours(0, 0, 0, 0);
  const e = end ? new Date(end) : new Date(start || new Date());
  e.setHours(23, 59, 59, 999);
  return { s, e };
}

// ─── GET /api/dashboard/stats?start=YYYY-MM-DD&end=YYYY-MM-DD ────────────────
// Returns: patientsCount, appointmentsCount, totalRevenue, pendingRevenue, lowStockCount
router.get('/stats', async (req, res) => {
  try {
    const { start, end } = req.query;
    const { s, e } = buildRange(start, end);

    const [patientsCount, appointmentsCount, billingDocs, lowStockCount] = await Promise.all([
      Patient.countDocuments({ createdAt: { $gte: s, $lte: e } }),
      Appointment.countDocuments({ date: { $gte: s, $lte: e } }),
      Billing.find({ createdAt: { $gte: s, $lte: e } }),
      Inventory.countDocuments({
        $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
      }),
    ]);

    const totalRevenue  = billingDocs.filter(b =>  b.paidStatus).reduce((acc, b) => acc + b.totalAmount, 0);
    const pendingRevenue = billingDocs.filter(b => !b.paidStatus).reduce((acc, b) => acc + b.totalAmount, 0);

    res.json({ patientsCount, appointmentsCount, totalRevenue, pendingRevenue, lowStockCount });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ─── GET /api/dashboard/chart?start=YYYY-MM-DD&end=YYYY-MM-DD ────────────────
// Returns: [{ date, label, patients, revenue }] — one entry per day in range
router.get('/chart', async (req, res) => {
  try {
    const { start, end } = req.query;
    const { s, e } = buildRange(start, end);

    const [patientAgg, revenueAgg] = await Promise.all([
      Patient.aggregate([
        { $match: { createdAt: { $gte: s, $lte: e } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Billing.aggregate([
        { $match: { createdAt: { $gte: s, $lte: e }, paidStatus: true } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: '$totalAmount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const patientMap = Object.fromEntries(patientAgg.map(p => [p._id, p.count]));
    const revenueMap = Object.fromEntries(revenueAgg.map(r => [r._id, r.total]));

    // Build one row per calendar day in the range
    const result = [];
    const cur = new Date(s);
    while (cur <= e) {
      const key = cur.toISOString().split('T')[0];
      result.push({
        date: key,
        label: cur.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        patients: patientMap[key] || 0,
        revenue: revenueMap[key] || 0,
      });
      cur.setDate(cur.getDate() + 1);
    }

    res.json(result);
  } catch (err) {
    console.error('Dashboard chart error:', err);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

// ─── GET /api/dashboard/diseases ─────────────────────────────────────────────
// Returns disease names: combines Disease model names + past prescription diagnoses
router.get('/diseases', async (req, res) => {
  try {
    const [diseaseNames, prescriptionDiagnoses] = await Promise.all([
      Disease.find().select('name').lean(),
      Prescription.distinct('diagnosis'),
    ]);
    const combined = [
      ...diseaseNames.map(d => d.name),
      ...prescriptionDiagnoses.filter(Boolean),
    ];
    // Deduplicate and sort
    const unique = [...new Set(combined)].sort();
    res.json(unique);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch diseases' });
  }
});

// ─── GET /api/dashboard/queue?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&disease=&patient=
// Returns appointments for a date range, optionally filtered by disease / patient name
router.get('/queue', async (req, res) => {
  try {
    const { date, startDate, endDate, disease, patient } = req.query;
    // Support both legacy ?date= and new ?startDate=&endDate=
    const from = startDate || date;
    const to   = endDate   || date;
    const { s, e } = buildRange(from, to);

    let appointments = await Appointment.find({ date: { $gte: s, $lte: e } })
      .sort({ tokenNumber: 1 })
      .lean();

    // Filter by patient name (client-friendly substring match)
    if (patient && patient.trim()) {
      const q = patient.trim().toLowerCase();
      appointments = appointments.filter(a =>
        a.patientName?.toLowerCase().includes(q)
      );
    }

    // Filter by disease — find prescriptions with matching diagnosis, then filter appointments
    if (disease && disease.trim()) {
      const matchedPrescriptions = await Prescription.find({
        diagnosis: { $regex: disease.trim(), $options: 'i' },
      }).select('patientId').lean();

      const patientIds = new Set(matchedPrescriptions.map(p => p.patientId.toString()));
      appointments = appointments.filter(a =>
        patientIds.has(a.patientId?.toString())
      );
    }

    res.json(appointments);
  } catch (err) {
    console.error('Dashboard queue error:', err);
    res.status(500).json({ error: 'Failed to fetch queue' });
  }
});

export default router;
