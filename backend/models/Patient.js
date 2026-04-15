import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, min: 0, max: 150, default: 0 },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    contact: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    bloodGroup: { type: String, trim: true, default: '' },
    weight: { type: Number, default: 0 },
    medicalHist: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

patientSchema.index({ name: 'text', contact: 'text' });

export default mongoose.model('Patient', patientSchema);
