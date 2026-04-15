import mongoose from 'mongoose';

const diseaseSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, unique: true, trim: true },
    localName:     { type: String, default: '' },   // e.g. "Hyperacidity / GERD"
    type:          { type: String, default: '' },   // e.g. "Digestive"
    mainDosha:     { type: String, default: '' },   // e.g. "Pitta"
    commonMedicines: [{ type: String }],
    pathya:        { type: String, default: '' },   // Do's
    apathya:       { type: String, default: '' },   // Don'ts
    description:   { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Disease', diseaseSchema);
