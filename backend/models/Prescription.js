import mongoose from 'mongoose';

const medicineEntrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    timing: { type: String, default: '' },
    anupan: { type: String, default: '' },
    days: { type: Number, default: 7 },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    diagnosis: { type: String, default: '' },
    medicines: { type: [medicineEntrySchema], required: true },
    pathya: { type: String, default: '' },
    apathya: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Prescription', prescriptionSchema);
