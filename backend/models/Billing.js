import mongoose from 'mongoose';

const billingItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const billingSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    patientName: { type: String, required: true },
    items: { type: [billingItemSchema], default: [] },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0 },
    paidStatus: { type: Boolean, default: false },
    billType: {
      type: String,
      enum: ['Consultation', 'Medicine', 'Procedure', 'Other'],
      default: 'Consultation',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Card', 'Other'],
      default: 'Cash',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Billing', billingSchema);
