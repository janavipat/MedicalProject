import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    patientName: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, default: '' },
    reason: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Waiting', 'Scheduled', 'Completed', 'Cancelled'],
      default: 'Waiting',
    },
    tokenNumber: { type: Number },
    isEmergency: { type: Boolean, default: false },
    notes: { type: String, default: '' },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    age: { type: Number, default: null },
    bloodGroup: { type: String, default: '' },
    weight: { type: Number, default: null },
    address: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Appointment', appointmentSchema);
