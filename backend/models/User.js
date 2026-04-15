import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true }, // Firebase UID
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['Doctor', 'Receptionist'],
      default: 'Receptionist',
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
