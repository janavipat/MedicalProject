import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    medicineName: { type: String, required: true, trim: true },
    brand: { type: String, default: '' },
    formulation: { type: String, default: '' }, // e.g. Churna, Tablet, Syrup
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    price: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date },
    lowStockThreshold: { type: Number, default: 10 },
  },
  { timestamps: true }
);

inventorySchema.index({ medicineName: 'text' });

inventorySchema.virtual('stockStatus').get(function () {
  if (this.stockQuantity === 0) return 'Out of Stock';
  if (this.stockQuantity <= this.lowStockThreshold) return 'Low Stock';
  return 'In Stock';
});

export default mongoose.model('Inventory', inventorySchema);
