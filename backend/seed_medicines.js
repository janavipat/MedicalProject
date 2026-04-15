/**
 * Seed script — populates MongoDB with 74 Ayurvedic & modern medicines.
 * Run: npm run seed
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Inventory from './models/Inventory.js';

dotenv.config();

const medicines = [
  // Ayurvedic Churnas
  { medicineName: 'Triphala Churna', brand: 'Dabur', formulation: 'Churna', stockQuantity: 100, price: 120, lowStockThreshold: 15 },
  { medicineName: 'Avipattikar Churna', brand: 'Baidyanath', formulation: 'Churna', stockQuantity: 80, price: 95, lowStockThreshold: 10 },
  { medicineName: 'Ashwagandha Churna', brand: 'Himalaya', formulation: 'Churna', stockQuantity: 120, price: 180, lowStockThreshold: 20 },
  { medicineName: 'Shatavari Churna', brand: 'Patanjali', formulation: 'Churna', stockQuantity: 60, price: 150, lowStockThreshold: 10 },
  { medicineName: 'Trikatu Churna', brand: 'Baidyanath', formulation: 'Churna', stockQuantity: 70, price: 85, lowStockThreshold: 10 },
  { medicineName: 'Sitopaladi Churna', brand: 'Dabur', formulation: 'Churna', stockQuantity: 50, price: 75, lowStockThreshold: 10 },
  { medicineName: 'Hingwashtak Churna', brand: 'Baidyanath', formulation: 'Churna', stockQuantity: 45, price: 90, lowStockThreshold: 8 },
  { medicineName: 'Mahasudarshan Churna', brand: 'Unjha', formulation: 'Churna', stockQuantity: 30, price: 110, lowStockThreshold: 8 },
  { medicineName: 'Chandraprabha Vati Churna', brand: 'Dabur', formulation: 'Churna', stockQuantity: 55, price: 130, lowStockThreshold: 10 },
  { medicineName: 'Lavanbhaskar Churna', brand: 'Baidyanath', formulation: 'Churna', stockQuantity: 40, price: 80, lowStockThreshold: 8 },

  // Ayurvedic Vati / Tablets
  { medicineName: 'Yograj Guggulu', brand: 'Dabur', formulation: 'Tablet', stockQuantity: 200, price: 210, lowStockThreshold: 30 },
  { medicineName: 'Kaishore Guggulu', brand: 'Baidyanath', formulation: 'Tablet', stockQuantity: 150, price: 195, lowStockThreshold: 20 },
  { medicineName: 'Chandraprabha Vati', brand: 'Himalaya', formulation: 'Tablet', stockQuantity: 180, price: 220, lowStockThreshold: 25 },
  { medicineName: 'Arogyavardhini Vati', brand: 'Baidyanath', formulation: 'Tablet', stockQuantity: 100, price: 185, lowStockThreshold: 15 },
  { medicineName: 'Sutshekhar Rasa', brand: 'Unjha', formulation: 'Tablet', stockQuantity: 80, price: 250, lowStockThreshold: 10 },
  { medicineName: 'Sarpagandha Vati', brand: 'Dabur', formulation: 'Tablet', stockQuantity: 60, price: 175, lowStockThreshold: 10 },
  { medicineName: 'Punarnavadi Mandoor', brand: 'Baidyanath', formulation: 'Tablet', stockQuantity: 90, price: 190, lowStockThreshold: 12 },
  { medicineName: 'Agnitundi Vati', brand: 'Unjha', formulation: 'Tablet', stockQuantity: 70, price: 160, lowStockThreshold: 10 },
  { medicineName: 'Shankha Vati', brand: 'Dabur', formulation: 'Tablet', stockQuantity: 85, price: 145, lowStockThreshold: 12 },
  { medicineName: 'Triphala Guggulu', brand: 'Himalaya', formulation: 'Tablet', stockQuantity: 110, price: 200, lowStockThreshold: 15 },
  { medicineName: 'Medohar Guggulu', brand: 'Baidyanath', formulation: 'Tablet', stockQuantity: 95, price: 215, lowStockThreshold: 15 },

  // Ayurvedic Syrups / Asavas
  { medicineName: 'Abhayarishta', brand: 'Dabur', formulation: 'Syrup', stockQuantity: 50, price: 135, lowStockThreshold: 8 },
  { medicineName: 'Ashokarishta', brand: 'Baidyanath', formulation: 'Syrup', stockQuantity: 45, price: 145, lowStockThreshold: 8 },
  { medicineName: 'Dashmularishta', brand: 'Dabur', formulation: 'Syrup', stockQuantity: 55, price: 160, lowStockThreshold: 8 },
  { medicineName: 'Drakshasava', brand: 'Unjha', formulation: 'Syrup', stockQuantity: 40, price: 125, lowStockThreshold: 6 },
  { medicineName: 'Parthadyarishta', brand: 'Baidyanath', formulation: 'Syrup', stockQuantity: 30, price: 155, lowStockThreshold: 6 },
  { medicineName: 'Kumaryasava', brand: 'Dabur', formulation: 'Syrup', stockQuantity: 35, price: 140, lowStockThreshold: 6 },
  { medicineName: 'Saraswatarishta', brand: 'Baidyanath', formulation: 'Syrup', stockQuantity: 42, price: 170, lowStockThreshold: 6 },
  { medicineName: 'Vasarishta', brand: 'Unjha', formulation: 'Syrup', stockQuantity: 28, price: 130, lowStockThreshold: 6 },

  // Ayurvedic Ghrita / Oils
  { medicineName: 'Brahmi Ghrita', brand: 'Dabur', formulation: 'Ghrita', stockQuantity: 25, price: 320, lowStockThreshold: 5 },
  { medicineName: 'Mahanarayan Oil', brand: 'Dabur', formulation: 'Oil', stockQuantity: 60, price: 285, lowStockThreshold: 8 },
  { medicineName: 'Dhanwantharam Oil', brand: 'Kottakal', formulation: 'Oil', stockQuantity: 40, price: 350, lowStockThreshold: 6 },
  { medicineName: 'Sesame Oil (Til Tail)', brand: 'Generic', formulation: 'Oil', stockQuantity: 80, price: 90, lowStockThreshold: 10 },
  { medicineName: 'Pinda Oil', brand: 'Kottakal', formulation: 'Oil', stockQuantity: 30, price: 310, lowStockThreshold: 5 },

  // Ayurvedic Bhasmas
  { medicineName: 'Swarna Makshika Bhasma', brand: 'Unjha', formulation: 'Bhasma', stockQuantity: 20, price: 450, lowStockThreshold: 4 },
  { medicineName: 'Praval Pishti', brand: 'Baidyanath', formulation: 'Bhasma', stockQuantity: 25, price: 380, lowStockThreshold: 4 },
  { medicineName: 'Mukta Pishti', brand: 'Unjha', formulation: 'Bhasma', stockQuantity: 15, price: 520, lowStockThreshold: 3 },
  { medicineName: 'Abhrak Bhasma', brand: 'Dabur', formulation: 'Bhasma', stockQuantity: 18, price: 410, lowStockThreshold: 3 },
  { medicineName: 'Lauha Bhasma', brand: 'Baidyanath', formulation: 'Bhasma', stockQuantity: 22, price: 290, lowStockThreshold: 4 },

  // Single Herb Capsules
  { medicineName: 'Giloy (Guduchi) Capsule', brand: 'Himalaya', formulation: 'Capsule', stockQuantity: 150, price: 165, lowStockThreshold: 20 },
  { medicineName: 'Tulsi Extract Capsule', brand: 'Himalaya', formulation: 'Capsule', stockQuantity: 120, price: 140, lowStockThreshold: 15 },
  { medicineName: 'Neem Capsule', brand: 'Himalaya', formulation: 'Capsule', stockQuantity: 100, price: 130, lowStockThreshold: 15 },
  { medicineName: 'Brahmi Capsule', brand: 'Himalaya', formulation: 'Capsule', stockQuantity: 90, price: 175, lowStockThreshold: 12 },
  { medicineName: 'Karela Capsule', brand: 'Himalaya', formulation: 'Capsule', stockQuantity: 80, price: 145, lowStockThreshold: 10 },
  { medicineName: 'Haritaki Capsule', brand: 'Patanjali', formulation: 'Capsule', stockQuantity: 70, price: 120, lowStockThreshold: 10 },
  { medicineName: 'Amalaki Capsule', brand: 'Himalaya', formulation: 'Capsule', stockQuantity: 85, price: 135, lowStockThreshold: 12 },
  { medicineName: 'Bibhitaki Capsule', brand: 'Generic', formulation: 'Capsule', stockQuantity: 50, price: 110, lowStockThreshold: 8 },

  // Patent Ayurvedic
  { medicineName: 'Chyawanprash', brand: 'Dabur', formulation: 'Jam', stockQuantity: 40, price: 280, lowStockThreshold: 6 },
  { medicineName: 'Triphala Tablet', brand: 'Patanjali', formulation: 'Tablet', stockQuantity: 200, price: 85, lowStockThreshold: 25 },
  { medicineName: 'Liv.52', brand: 'Himalaya', formulation: 'Tablet', stockQuantity: 180, price: 195, lowStockThreshold: 25 },
  { medicineName: 'Septilin Tablet', brand: 'Himalaya', formulation: 'Tablet', stockQuantity: 120, price: 175, lowStockThreshold: 15 },
  { medicineName: 'Speman Tablet', brand: 'Himalaya', formulation: 'Tablet', stockQuantity: 90, price: 210, lowStockThreshold: 12 },

  // Modern / Allopathic
  { medicineName: 'Pantoprazole 40mg', brand: 'Generic', formulation: 'Tablet', stockQuantity: 300, price: 45, lowStockThreshold: 50 },
  { medicineName: 'Metformin 500mg', brand: 'Generic', formulation: 'Tablet', stockQuantity: 250, price: 30, lowStockThreshold: 40 },
  { medicineName: 'Amlodipine 5mg', brand: 'Generic', formulation: 'Tablet', stockQuantity: 200, price: 35, lowStockThreshold: 30 },
  { medicineName: 'Atorvastatin 10mg', brand: 'Generic', formulation: 'Tablet', stockQuantity: 180, price: 55, lowStockThreshold: 25 },
  { medicineName: 'Cetirizine 10mg', brand: 'Generic', formulation: 'Tablet', stockQuantity: 350, price: 20, lowStockThreshold: 50 },
  { medicineName: 'Azithromycin 500mg', brand: 'Generic', formulation: 'Tablet', stockQuantity: 120, price: 70, lowStockThreshold: 20 },
  { medicineName: 'Amoxicillin 500mg', brand: 'Generic', formulation: 'Capsule', stockQuantity: 150, price: 60, lowStockThreshold: 25 },
  { medicineName: 'Paracetamol 500mg', brand: 'Generic', formulation: 'Tablet', stockQuantity: 500, price: 15, lowStockThreshold: 100 },
  { medicineName: 'Ibuprofen 400mg', brand: 'Generic', formulation: 'Tablet', stockQuantity: 300, price: 25, lowStockThreshold: 50 },
  { medicineName: 'Omeprazole 20mg', brand: 'Generic', formulation: 'Capsule', stockQuantity: 280, price: 40, lowStockThreshold: 40 },
  { medicineName: 'Vitamin D3 60000 IU', brand: 'Generic', formulation: 'Capsule', stockQuantity: 160, price: 75, lowStockThreshold: 20 },
  { medicineName: 'Vitamin B-Complex', brand: 'Generic', formulation: 'Tablet', stockQuantity: 220, price: 50, lowStockThreshold: 30 },
  { medicineName: 'Iron + Folic Acid', brand: 'Generic', formulation: 'Tablet', stockQuantity: 190, price: 35, lowStockThreshold: 30 },
  { medicineName: 'Calcium + Vitamin D3', brand: 'Generic', formulation: 'Tablet', stockQuantity: 170, price: 65, lowStockThreshold: 25 },
  { medicineName: 'Multivitamin Tablet', brand: 'Generic', formulation: 'Tablet', stockQuantity: 200, price: 80, lowStockThreshold: 25 },
  { medicineName: 'ORS Sachet', brand: 'Generic', formulation: 'Sachet', stockQuantity: 400, price: 10, lowStockThreshold: 80 },
  { medicineName: 'Antacid Suspension', brand: 'Generic', formulation: 'Syrup', stockQuantity: 100, price: 55, lowStockThreshold: 15 },
  { medicineName: 'Cough Syrup', brand: 'Generic', formulation: 'Syrup', stockQuantity: 90, price: 85, lowStockThreshold: 12 },
  { medicineName: 'Betadine Solution', brand: 'Cipla', formulation: 'Solution', stockQuantity: 60, price: 95, lowStockThreshold: 10 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    let added = 0;
    let skipped = 0;

    for (const med of medicines) {
      const exists = await Inventory.findOne({ medicineName: med.medicineName });
      if (exists) {
        skipped++;
        continue;
      }
      await Inventory.create(med);
      added++;
    }

    console.log(`Seeding complete: ${added} added, ${skipped} already existed`);
  } catch (err) {
    console.error('Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
