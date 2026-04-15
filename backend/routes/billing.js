import { Router } from 'express';
import Billing from '../models/Billing.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

// GET /api/billing — all invoices with filters
router.get('/', async (req, res) => {
  try {
    const { patientId, paidStatus, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (patientId) filter.patientId = patientId;
    if (paidStatus !== undefined) filter.paidStatus = paidStatus === 'true';

    const bills = await Billing.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Billing.countDocuments(filter);

    // Revenue summary
    const allBills = await Billing.find();
    const totalRevenue = allBills.filter(b => b.paidStatus).reduce((s, b) => s + b.totalAmount, 0);
    const pendingRevenue = allBills.filter(b => !b.paidStatus).reduce((s, b) => s + b.totalAmount, 0);

    res.json({ bills, total, totalRevenue, pendingRevenue });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch billing records' });
  }
});

// GET /api/billing/:id
router.get('/:id', async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Invoice not found' });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// POST /api/billing — generate a new invoice
router.post('/', async (req, res) => {
  try {
    const { patientId, patientName, items, totalAmount, billType, paymentMethod, notes } = req.body;

    if (!patientId || !patientName || totalAmount == null) {
      return res.status(400).json({ error: 'patientId, patientName, and totalAmount are required' });
    }

    const bill = new Billing({ patientId, patientName, items, totalAmount, billType, paymentMethod, notes });
    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
});

// PATCH /api/billing/:id/pay — mark invoice as paid
router.patch('/:id/pay', async (req, res) => {
  try {
    const { paidAmount, paymentMethod } = req.body;
    const bill = await Billing.findByIdAndUpdate(
      req.params.id,
      { paidStatus: true, paidAmount: paidAmount || undefined, paymentMethod: paymentMethod || undefined },
      { new: true }
    );
    if (!bill) return res.status(404).json({ error: 'Invoice not found' });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// PUT /api/billing/:id
router.put('/:id', async (req, res) => {
  try {
    const bill = await Billing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!bill) return res.status(404).json({ error: 'Invoice not found' });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// DELETE /api/billing/:id
router.delete('/:id', async (req, res) => {
  try {
    const bill = await Billing.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ message: 'Invoice deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

export default router;
