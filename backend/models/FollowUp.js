import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    patientName: { type: String, required: true },
    contact: { type: String, required: true },
    diagnosis: { type: String, default: '' },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Called', 'Scheduled', 'Completed', 'Overdue'],
      default: 'Pending',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('FollowUp', followUpSchema);
