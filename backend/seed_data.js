/**
 * AyurClinic — Comprehensive Seed Script
 * Seeds medicines (Inventory) + diseases (Disease) into MongoDB Atlas
 * Run: node seed_data.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Inventory from './models/Inventory.js';
import Disease from './models/Disease.js';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('❌ MONGODB_URI not set in .env'); process.exit(1); }

// ─── MEDICINES ────────────────────────────────────────────────────────────────
const MEDICINES = [
  // Churna (Powders)
  { medicineName: 'Triphala Churna',       brand: 'Baidyanath',       formulation: 'Churna',  stockQuantity: 50, price: 120, lowStockThreshold: 10 },
  { medicineName: 'Avipattikar Churna',    brand: 'Patanjali',        formulation: 'Churna',  stockQuantity: 40, price: 95,  lowStockThreshold: 10 },
  { medicineName: 'Ashwagandha Churna',    brand: 'Himalaya',         formulation: 'Churna',  stockQuantity: 60, price: 180, lowStockThreshold: 15 },
  { medicineName: 'Sitopaladi Churna',     brand: 'Dabur',            formulation: 'Churna',  stockQuantity: 35, price: 85,  lowStockThreshold: 10 },
  { medicineName: 'Mahasudarshan Churna',  brand: 'Baidyanath',       formulation: 'Churna',  stockQuantity: 25, price: 140, lowStockThreshold: 8  },
  { medicineName: 'Hingwashtak Churna',    brand: 'Patanjali',        formulation: 'Churna',  stockQuantity: 30, price: 75,  lowStockThreshold: 8  },
  { medicineName: 'Trikatu Churna',        brand: 'Baidyanath',       formulation: 'Churna',  stockQuantity: 45, price: 65,  lowStockThreshold: 10 },
  { medicineName: 'Panchaskar Churna',     brand: 'Dhootapapeshwar',  formulation: 'Churna',  stockQuantity: 20, price: 90,  lowStockThreshold: 8  },
  { medicineName: 'Shatavari Churna',      brand: 'Himalaya',         formulation: 'Churna',  stockQuantity: 55, price: 160, lowStockThreshold: 12 },
  { medicineName: 'Musali Churna',         brand: 'Baidyanath',       formulation: 'Churna',  stockQuantity: 25, price: 220, lowStockThreshold: 8  },
  { medicineName: 'Brahmi Churna',         brand: 'Patanjali',        formulation: 'Churna',  stockQuantity: 30, price: 110, lowStockThreshold: 8  },
  { medicineName: 'Shankhapushpi Churna',  brand: 'Dabur',            formulation: 'Churna',  stockQuantity: 28, price: 130, lowStockThreshold: 8  },
  { medicineName: 'Gokshura Churna',       brand: 'Baidyanath',       formulation: 'Churna',  stockQuantity: 32, price: 145, lowStockThreshold: 8  },
  { medicineName: 'Punarnava Churna',      brand: 'Patanjali',        formulation: 'Churna',  stockQuantity: 22, price: 85,  lowStockThreshold: 8  },
  { medicineName: 'Kutaj Churna',          brand: 'Dhootapapeshwar',  formulation: 'Churna',  stockQuantity: 18, price: 95,  lowStockThreshold: 6  },
  { medicineName: 'Haritaki Churna',       brand: 'Baidyanath',       formulation: 'Churna',  stockQuantity: 40, price: 70,  lowStockThreshold: 10 },
  { medicineName: 'Amalaki Churna',        brand: 'Patanjali',        formulation: 'Churna',  stockQuantity: 45, price: 80,  lowStockThreshold: 10 },
  { medicineName: 'Bilva Churna',          brand: 'Baidyanath',       formulation: 'Churna',  stockQuantity: 15, price: 75,  lowStockThreshold: 6  },
  { medicineName: 'Pushkarmool Churna',    brand: 'Dhootapapeshwar',  formulation: 'Churna',  stockQuantity: 12, price: 200, lowStockThreshold: 5  },
  { medicineName: 'Vidanga Churna',        brand: 'Baidyanath',       formulation: 'Churna',  stockQuantity: 20, price: 90,  lowStockThreshold: 6  },

  // Vati / Guggulu (Tablets)
  { medicineName: 'Yograj Guggulu',        brand: 'Baidyanath',       formulation: 'Vati',    stockQuantity: 60, price: 210, lowStockThreshold: 15 },
  { medicineName: 'Triphala Guggulu',      brand: 'Baidyanath',       formulation: 'Vati',    stockQuantity: 50, price: 180, lowStockThreshold: 12 },
  { medicineName: 'Kanchanar Guggulu',     brand: 'Dhootapapeshwar',  formulation: 'Vati',    stockQuantity: 40, price: 195, lowStockThreshold: 10 },
  { medicineName: 'Arogyavardhini Vati',   brand: 'Baidyanath',       formulation: 'Vati',    stockQuantity: 55, price: 155, lowStockThreshold: 12 },
  { medicineName: 'Chandraprabha Vati',    brand: 'Himalaya',         formulation: 'Vati',    stockQuantity: 65, price: 165, lowStockThreshold: 15 },
  { medicineName: 'Chitrakadi Vati',       brand: 'Baidyanath',       formulation: 'Vati',    stockQuantity: 35, price: 120, lowStockThreshold: 10 },
  { medicineName: 'Brahmi Vati',           brand: 'Dhootapapeshwar',  formulation: 'Vati',    stockQuantity: 45, price: 175, lowStockThreshold: 10 },
  { medicineName: 'Sarpagandha Vati',      brand: 'Baidyanath',       formulation: 'Vati',    stockQuantity: 30, price: 140, lowStockThreshold: 8  },
  { medicineName: 'Gokshuradi Guggulu',    brand: 'Baidyanath',       formulation: 'Vati',    stockQuantity: 40, price: 185, lowStockThreshold: 10 },
  { medicineName: 'Kaishor Guggulu',       brand: 'Dhootapapeshwar',  formulation: 'Vati',    stockQuantity: 35, price: 200, lowStockThreshold: 10 },
  { medicineName: 'Punarnavadi Guggulu',   brand: 'Baidyanath',       formulation: 'Vati',    stockQuantity: 25, price: 190, lowStockThreshold: 8  },
  { medicineName: 'Sudarshan Vati',        brand: 'Dhootapapeshwar',  formulation: 'Vati',    stockQuantity: 28, price: 130, lowStockThreshold: 8  },
  { medicineName: 'Haridrakhand Vati',     brand: 'Baidyanath',       formulation: 'Vati',    stockQuantity: 22, price: 110, lowStockThreshold: 8  },
  { medicineName: 'Vasant Kusumakar Ras',  brand: 'Baidyanath',       formulation: 'Vati',    stockQuantity: 15, price: 850, lowStockThreshold: 5  },
  { medicineName: 'Nishamalaki Vati',      brand: 'Dhootapapeshwar',  formulation: 'Vati',    stockQuantity: 30, price: 145, lowStockThreshold: 8  },

  // Ras / Bhasma (Classical)
  { medicineName: 'Sutshekhar Ras',        brand: 'Baidyanath',       formulation: 'Ras',     stockQuantity: 20, price: 320, lowStockThreshold: 5  },
  { medicineName: 'Kamdudha Ras',          brand: 'Dhootapapeshwar',  formulation: 'Ras',     stockQuantity: 18, price: 280, lowStockThreshold: 5  },
  { medicineName: 'Tribhuvankirti Ras',    brand: 'Baidyanath',       formulation: 'Ras',     stockQuantity: 15, price: 250, lowStockThreshold: 5  },
  { medicineName: 'Praval Pishti',         brand: 'Baidyanath',       formulation: 'Pishti',  stockQuantity: 12, price: 380, lowStockThreshold: 5  },
  { medicineName: 'Swarna Makshik Bhasma', brand: 'Dhootapapeshwar',  formulation: 'Bhasma',  stockQuantity: 10, price: 420, lowStockThreshold: 4  },
  { medicineName: 'Abhrak Bhasma',         brand: 'Baidyanath',       formulation: 'Bhasma',  stockQuantity: 12, price: 350, lowStockThreshold: 4  },
  { medicineName: 'Jasad Bhasma',          brand: 'Dhootapapeshwar',  formulation: 'Bhasma',  stockQuantity: 15, price: 290, lowStockThreshold: 5  },
  { medicineName: 'Mukta Pishti',          brand: 'Baidyanath',       formulation: 'Pishti',  stockQuantity: 8,  price: 650, lowStockThreshold: 3  },
  { medicineName: 'Tankan Bhasma',         brand: 'Dhootapapeshwar',  formulation: 'Bhasma',  stockQuantity: 14, price: 180, lowStockThreshold: 5  },
  { medicineName: 'Naga Bhasma',           brand: 'Baidyanath',       formulation: 'Bhasma',  stockQuantity: 10, price: 310, lowStockThreshold: 4  },

  // Asava / Arishta (Fermented)
  { medicineName: 'Dashamoolarishta',      brand: 'Baidyanath',       formulation: 'Arishta', stockQuantity: 30, price: 175, lowStockThreshold: 8  },
  { medicineName: 'Kumaryasava',           brand: 'Kottakkal',        formulation: 'Asava',   stockQuantity: 25, price: 195, lowStockThreshold: 8  },
  { medicineName: 'Drakshasava',           brand: 'Baidyanath',       formulation: 'Asava',   stockQuantity: 20, price: 155, lowStockThreshold: 6  },
  { medicineName: 'Kanakasava',            brand: 'Dhootapapeshwar',  formulation: 'Asava',   stockQuantity: 15, price: 220, lowStockThreshold: 5  },
  { medicineName: 'Lohasava',              brand: 'Baidyanath',       formulation: 'Asava',   stockQuantity: 18, price: 165, lowStockThreshold: 6  },
  { medicineName: 'Saraswatarishta',       brand: 'Baidyanath',       formulation: 'Arishta', stockQuantity: 22, price: 185, lowStockThreshold: 6  },
  { medicineName: 'Ashwagandharishta',     brand: 'Himalaya',         formulation: 'Arishta', stockQuantity: 28, price: 200, lowStockThreshold: 8  },
  { medicineName: 'Balarishta',            brand: 'Baidyanath',       formulation: 'Arishta', stockQuantity: 16, price: 175, lowStockThreshold: 6  },
  { medicineName: 'Punarnavasava',         brand: 'Dhootapapeshwar',  formulation: 'Asava',   stockQuantity: 20, price: 160, lowStockThreshold: 6  },
  { medicineName: 'Abhayarishta',          brand: 'Baidyanath',       formulation: 'Arishta', stockQuantity: 18, price: 145, lowStockThreshold: 6  },
  { medicineName: 'Amritarishta',          brand: 'Baidyanath',       formulation: 'Arishta', stockQuantity: 14, price: 190, lowStockThreshold: 5  },
  { medicineName: 'Jirakadyarishta',       brand: 'Dhootapapeshwar',  formulation: 'Arishta', stockQuantity: 12, price: 155, lowStockThreshold: 5  },

  // Kwath / Kadha (Decoctions)
  { medicineName: 'Maharasnadi Kwath',     brand: 'Kottakkal',        formulation: 'Kwath',   stockQuantity: 20, price: 245, lowStockThreshold: 6  },
  { medicineName: 'Dashmoola Kwath',       brand: 'Baidyanath',       formulation: 'Kwath',   stockQuantity: 18, price: 220, lowStockThreshold: 6  },
  { medicineName: 'Punarnavadi Kwath',     brand: 'Kottakkal',        formulation: 'Kwath',   stockQuantity: 15, price: 230, lowStockThreshold: 5  },
  { medicineName: 'Varanadi Kwath',        brand: 'Dhootapapeshwar',  formulation: 'Kwath',   stockQuantity: 12, price: 215, lowStockThreshold: 5  },
  { medicineName: 'Sahacharadi Kwath',     brand: 'Kottakkal',        formulation: 'Kwath',   stockQuantity: 14, price: 235, lowStockThreshold: 5  },
  { medicineName: 'Panchakola Kwath',      brand: 'Baidyanath',       formulation: 'Kwath',   stockQuantity: 10, price: 195, lowStockThreshold: 4  },

  // Avaleha / Lehya (Jams)
  { medicineName: 'Chyawanprash',          brand: 'Dabur',            formulation: 'Avaleha', stockQuantity: 35, price: 280, lowStockThreshold: 10 },
  { medicineName: 'Brahma Rasayana',       brand: 'Kottakkal',        formulation: 'Avaleha', stockQuantity: 12, price: 380, lowStockThreshold: 5  },
  { medicineName: 'Vasavaleha',            brand: 'Baidyanath',       formulation: 'Avaleha', stockQuantity: 10, price: 290, lowStockThreshold: 4  },
  { medicineName: 'Agastya Rasayana',      brand: 'Dhootapapeshwar',  formulation: 'Avaleha', stockQuantity: 8,  price: 320, lowStockThreshold: 4  },
  { medicineName: 'Kushmanda Rasayana',    brand: 'Baidyanath',       formulation: 'Avaleha', stockQuantity: 10, price: 275, lowStockThreshold: 4  },

  // Taila (Oils)
  { medicineName: 'Mahanarayan Taila',     brand: 'Baidyanath',       formulation: 'Taila',   stockQuantity: 25, price: 195, lowStockThreshold: 8  },
  { medicineName: 'Bala Taila',            brand: 'Kottakkal',        formulation: 'Taila',   stockQuantity: 18, price: 220, lowStockThreshold: 6  },
  { medicineName: 'Ksheerabala Taila',     brand: 'Kottakkal',        formulation: 'Taila',   stockQuantity: 15, price: 240, lowStockThreshold: 5  },
  { medicineName: 'Dhanwantaram Taila',    brand: 'Kottakkal',        formulation: 'Taila',   stockQuantity: 12, price: 260, lowStockThreshold: 5  },
  { medicineName: 'Sahacharadi Taila',     brand: 'Kottakkal',        formulation: 'Taila',   stockQuantity: 14, price: 230, lowStockThreshold: 5  },
  { medicineName: 'Anu Taila',             brand: 'Kottakkal',        formulation: 'Taila',   stockQuantity: 10, price: 210, lowStockThreshold: 4  },
  { medicineName: 'Pinda Taila',           brand: 'Dhootapapeshwar',  formulation: 'Taila',   stockQuantity: 8,  price: 255, lowStockThreshold: 4  },

  // Single Herbs
  { medicineName: 'Shatavari (Extract)',   brand: 'Himalaya',         formulation: 'Capsule', stockQuantity: 50, price: 320, lowStockThreshold: 12 },
  { medicineName: 'Ashwagandha (Extract)', brand: 'Himalaya',         formulation: 'Capsule', stockQuantity: 55, price: 350, lowStockThreshold: 12 },
  { medicineName: 'Giloy (Guduchi) Sat',   brand: 'Patanjali',        formulation: 'Sat',     stockQuantity: 30, price: 145, lowStockThreshold: 10 },
  { medicineName: 'Haridra (Turmeric)',    brand: 'Himalaya',         formulation: 'Capsule', stockQuantity: 45, price: 195, lowStockThreshold: 12 },
  { medicineName: 'Neem Capsule',          brand: 'Himalaya',         formulation: 'Capsule', stockQuantity: 40, price: 175, lowStockThreshold: 10 },
  { medicineName: 'Arjuna Capsule',        brand: 'Himalaya',         formulation: 'Capsule', stockQuantity: 35, price: 260, lowStockThreshold: 10 },
  { medicineName: 'Brahmi (Extract)',      brand: 'Himalaya',         formulation: 'Capsule', stockQuantity: 38, price: 290, lowStockThreshold: 10 },
  { medicineName: 'Manjishtha Capsule',    brand: 'Dhootapapeshwar',  formulation: 'Capsule', stockQuantity: 25, price: 220, lowStockThreshold: 8  },
  { medicineName: 'Yashtimadhu (Mulethi)', brand: 'Baidyanath',       formulation: 'Churna',  stockQuantity: 30, price: 110, lowStockThreshold: 8  },
  { medicineName: 'Pippali (Long Pepper)', brand: 'Baidyanath',       formulation: 'Churna',  stockQuantity: 20, price: 95,  lowStockThreshold: 6  },
  { medicineName: 'Bhringraj Capsule',     brand: 'Himalaya',         formulation: 'Capsule', stockQuantity: 28, price: 240, lowStockThreshold: 8  },
  { medicineName: 'Bhumyamalaki',          brand: 'Himalaya',         formulation: 'Capsule', stockQuantity: 22, price: 210, lowStockThreshold: 6  },
  { medicineName: 'Guduchi (Giloy) Vati',  brand: 'Baidyanath',       formulation: 'Vati',    stockQuantity: 35, price: 165, lowStockThreshold: 10 },
  { medicineName: 'Sariva (Anantmool)',    brand: 'Dhootapapeshwar',  formulation: 'Churna',  stockQuantity: 18, price: 130, lowStockThreshold: 6  },

  // Modern/Combination
  { medicineName: 'Cystone',              brand: 'Himalaya',          formulation: 'Tablet',  stockQuantity: 40, price: 155, lowStockThreshold: 10 },
  { medicineName: 'Liv.52 DS',            brand: 'Himalaya',          formulation: 'Tablet',  stockQuantity: 45, price: 185, lowStockThreshold: 12 },
  { medicineName: 'Septilin',             brand: 'Himalaya',          formulation: 'Tablet',  stockQuantity: 35, price: 145, lowStockThreshold: 10 },
  { medicineName: 'Mentat',               brand: 'Himalaya',          formulation: 'Tablet',  stockQuantity: 30, price: 195, lowStockThreshold: 8  },
  { medicineName: 'Tentex Royal',         brand: 'Himalaya',          formulation: 'Capsule', stockQuantity: 25, price: 265, lowStockThreshold: 8  },
  { medicineName: 'Diabecon DS',          brand: 'Himalaya',          formulation: 'Tablet',  stockQuantity: 35, price: 210, lowStockThreshold: 10 },
  { medicineName: 'Reosto',               brand: 'Himalaya',          formulation: 'Tablet',  stockQuantity: 28, price: 230, lowStockThreshold: 8  },
  { medicineName: 'Bonnispaz',            brand: 'Himalaya',          formulation: 'Syrup',   stockQuantity: 20, price: 120, lowStockThreshold: 6  },
];

// ─── DISEASES ─────────────────────────────────────────────────────────────────
const DISEASES = [
  {
    name: 'Amlapitta',
    localName: 'Hyperacidity / GERD',
    type: 'Digestive',
    mainDosha: 'Pitta',
    commonMedicines: ['Avipattikar Churna', 'Sutshekhar Ras', 'Kamdudha Ras', 'Yashtimadhu (Mulethi)', 'Praval Pishti'],
    pathya: 'Old rice, moong dal, cucumber, coconut water, milk, ghee, pomegranate, cold water, alkaline foods',
    apathya: 'Spicy foods, sour foods, fried items, tea, coffee, alcohol, fermented foods, excess salt',
    description: 'Excessive secretion of gastric acid causing burning sensation, sour belching, and indigestion.',
  },
  {
    name: 'Sandhigata Vata',
    localName: 'Osteoarthritis / Joint Pain',
    type: 'Musculoskeletal',
    mainDosha: 'Vata',
    commonMedicines: ['Yograj Guggulu', 'Maharasnadi Kwath', 'Ashwagandha Churna', 'Mahanarayan Taila', 'Dashamoolarishta'],
    pathya: 'Warm light food, sesame seeds, garlic, ginger, warm milk with turmeric, gentle exercise, oil massage',
    apathya: 'Cold food, exposure to cold wind, fasting, dry food, excessive walking, raw vegetables',
    description: 'Degenerative joint disease characterized by pain, stiffness, and reduced range of motion.',
  },
  {
    name: 'Madhumeha',
    localName: 'Diabetes Mellitus Type 2',
    type: 'Metabolic',
    mainDosha: 'Kapha',
    commonMedicines: ['Vasant Kusumakar Ras', 'Chandraprabha Vati', 'Nishamalaki Vati', 'Haridra (Turmeric)', 'Diabecon DS'],
    pathya: 'Bitter vegetables (karela, methi), barley, horse gram, old rice, light exercise, yoga',
    apathya: 'Sugar, sweets, rice, potato, banana, fruit juices, sedentary lifestyle, excess sleep',
    description: 'Metabolic disorder with elevated blood glucose due to insulin resistance or deficiency.',
  },
  {
    name: 'Tamaka Shwasa',
    localName: 'Bronchial Asthma / COPD',
    type: 'Respiratory',
    mainDosha: 'Kapha-Vata',
    commonMedicines: ['Sitopaladi Churna', 'Kanakasava', 'Pushkarmool Churna', 'Vasavaleha', 'Agastya Rasayana'],
    pathya: 'Warm light food, ginger tea, honey, rock salt, steam inhalation, avoid cold, yoga pranayama',
    apathya: 'Cold food, cold water, milk products, banana, dust, smoke, cold weather, allergens',
    description: 'Chronic respiratory condition with airway inflammation causing wheezing, breathlessness and cough.',
  },
  {
    name: 'Arsha',
    localName: 'Hemorrhoids / Piles',
    type: 'Digestive',
    mainDosha: 'Vata-Pitta',
    commonMedicines: ['Abhayarishta', 'Arshakuthar Ras', 'Triphala Churna', 'Arogyavardhini Vati', 'Panchaskar Churna'],
    pathya: 'High fiber diet, buttermilk, pomegranate, barley, plenty of water, figs, raisins, sitz bath',
    apathya: 'Spicy food, constipating foods, sitting for long hours, alcohol, dry food, straining at stool',
    description: 'Swollen and inflamed veins in the rectum and anus causing bleeding and pain.',
  },
  {
    name: 'Pandu',
    localName: 'Anemia / Iron Deficiency',
    type: 'Hematological',
    mainDosha: 'Pitta-Vata',
    commonMedicines: ['Lohasava', 'Punarnava Churna', 'Drakshasava', 'Ashwagandha Churna', 'Abhrak Bhasma'],
    pathya: 'Iron-rich foods, pomegranate, dates, jaggery, spinach, beetroot, vitamin C rich foods',
    apathya: 'Tea/coffee with meals, excess milk (can inhibit iron absorption), alcohol, spicy food',
    description: 'Deficiency of red blood cells or hemoglobin causing fatigue, pallor, and weakness.',
  },
  {
    name: 'Kamala',
    localName: 'Jaundice / Liver Disorders',
    type: 'Hepatic',
    mainDosha: 'Pitta',
    commonMedicines: ['Arogyavardhini Vati', 'Bhumyamalaki', 'Kutaj Churna', 'Liv.52 DS', 'Punarnavadi Kwath'],
    pathya: 'Sugarcane juice, coconut water, pomegranate, light easily digestible food, rest, buttermilk',
    apathya: 'Fatty food, oily food, alcohol, hot spicy food, non-veg, excess protein, physical exertion',
    description: 'Yellowing of skin and eyes due to elevated bilirubin from liver dysfunction.',
  },
  {
    name: 'Kustha',
    localName: 'Psoriasis / Chronic Skin Disease',
    type: 'Dermatological',
    mainDosha: 'Tridosha',
    commonMedicines: ['Kaishor Guggulu', 'Manjishtha Capsule', 'Sariva (Anantmool)', 'Arogyavardhini Vati', 'Neem Capsule'],
    pathya: 'Bitter vegetables, turmeric, neem, cooling foods, light diet, adequate water intake',
    apathya: 'Fish, milk + sour combination, alcohol, incompatible foods, excess salt, sesame seeds',
    description: 'Chronic inflammatory skin condition with reddish, scaly patches and itching.',
  },
  {
    name: 'Prameha',
    localName: 'Urinary Disorders / Pre-Diabetes',
    type: 'Urinary',
    mainDosha: 'Kapha',
    commonMedicines: ['Chandraprabha Vati', 'Gokshuradi Guggulu', 'Punarnavadi Guggulu', 'Haridra (Turmeric)', 'Triphala Churna'],
    pathya: 'Barley, old rice, horse gram, bitter vegetables, light exercise, adequate water',
    apathya: 'Sugar, sweets, rice, fermented food, sedentary habits, excess sleep, fatty food',
    description: 'Group of urinary disorders characterized by excessive, turbid or abnormal urination.',
  },
  {
    name: 'Shirashoola',
    localName: 'Headache / Migraine',
    type: 'Neurological',
    mainDosha: 'Vata-Pitta',
    commonMedicines: ['Sutshekhar Ras', 'Brahmi Vati', 'Pathyaksha Dhatryadi Kwath', 'Shirashooladi Vajra Ras', 'Saraswatarishta'],
    pathya: 'Rest in dark quiet room, cold compress, meditation, proper sleep, light diet, yoga',
    apathya: 'Bright light, loud noise, stress, irregular sleep, fasting, watching screen excessively',
    description: 'Recurrent headaches often with throbbing pain, nausea and sensitivity to light.',
  },
  {
    name: 'Vataja Kasa',
    localName: 'Dry Cough / Allergic Cough',
    type: 'Respiratory',
    mainDosha: 'Vata',
    commonMedicines: ['Sitopaladi Churna', 'Vasavaleha', 'Yashtimadhu (Mulethi)', 'Tribhuvankirti Ras', 'Kanakasava'],
    pathya: 'Warm food and drinks, honey, ginger, tulsi tea, steam inhalation, warm milk with turmeric',
    apathya: 'Cold food, ice water, cold dairy, dust exposure, talking excessively, cold weather',
    description: 'Persistent dry cough without productive expectoration, often due to Vata imbalance.',
  },
  {
    name: 'Kaphaja Kasa',
    localName: 'Productive Cough / Bronchitis',
    type: 'Respiratory',
    mainDosha: 'Kapha',
    commonMedicines: ['Sitopaladi Churna', 'Trikatu Churna', 'Abhrak Bhasma', 'Kanakasava', 'Agastya Rasayana'],
    pathya: 'Light warm food, ginger, pepper, honey, steam inhalation, dry warm environment',
    apathya: 'Cold food, milk, banana, sweet food, cold environment, excess sleep',
    description: 'Cough with excessive mucus production indicating Kapha accumulation in respiratory tract.',
  },
  {
    name: 'Jwara',
    localName: 'Fever / Pyrexia',
    type: 'Infectious',
    mainDosha: 'Pitta',
    commonMedicines: ['Sudarshan Vati', 'Tribhuvankirti Ras', 'Mahasudarshan Churna', 'Guduchi (Giloy) Vati', 'Amritarishta'],
    pathya: 'Complete rest, warm water, light easily digestible food, barley water, coconut water, pomegranate juice',
    apathya: 'Fasting, heavy food, cold food, cold water, physical exertion, cold bath, sun exposure',
    description: 'Elevated body temperature as immune response to infection or inflammation.',
  },
  {
    name: 'Grahani',
    localName: 'Irritable Bowel Syndrome / Malabsorption',
    type: 'Digestive',
    mainDosha: 'Vata-Pitta',
    commonMedicines: ['Kutaj Churna', 'Chitrakadi Vati', 'Bilva Churna', 'Abhayarishta', 'Jirakadyarishta'],
    pathya: 'Old rice, pomegranate, buttermilk, bilva fruit, light digestible food, small frequent meals',
    apathya: 'Heavy food, fried food, raw vegetables, cold food, irregular meals, stress, alcohol',
    description: 'Digestive disorder with impaired absorption causing alternating diarrhea and constipation.',
  },
  {
    name: 'Mutrakrichra',
    localName: 'Urinary Tract Infection / Dysuria',
    type: 'Urinary',
    mainDosha: 'Pitta',
    commonMedicines: ['Cystone', 'Chandraprabha Vati', 'Gokshura Churna', 'Punarnavasava', 'Shilajit'],
    pathya: 'Plenty of water, coconut water, barley water, cooling foods, cucumber, coriander water',
    apathya: 'Spicy food, alcohol, holding urine, dehydration, excessive heat exposure',
    description: 'Painful urination with burning sensation due to infection or inflammation of urinary tract.',
  },
  {
    name: 'Asmari',
    localName: 'Urinary Calculi / Kidney Stones',
    type: 'Urinary',
    mainDosha: 'Vata-Pitta',
    commonMedicines: ['Cystone', 'Gokshuradi Guggulu', 'Punarnavadi Kwath', 'Chandraprabha Vati', 'Varanadi Kwath'],
    pathya: 'High fluid intake (3+ litres/day), barley water, coconut water, horse gram soup, lemon water',
    apathya: 'Spinach, tomato, beetroot, excess salt, red meat, alcohol, dehydration, sedentary life',
    description: 'Formation of calculi (stones) in kidneys, ureter or bladder causing severe colic pain.',
  },
  {
    name: 'Agnimandya',
    localName: 'Indigestion / Low Digestive Fire',
    type: 'Digestive',
    mainDosha: 'Vata-Pitta-Kapha',
    commonMedicines: ['Chitrakadi Vati', 'Hingwashtak Churna', 'Trikatu Churna', 'Panchakola Kwath', 'Jirakadyarishta'],
    pathya: 'Light fresh food, ginger, lemon, warm water, small frequent meals, proper chewing',
    apathya: 'Heavy food, overeating, cold food, drinking water before/during meals, sleeping after meals',
    description: 'Decreased digestive capacity leading to incomplete digestion and accumulation of ama.',
  },
  {
    name: 'Atisara',
    localName: 'Diarrhea / Loose Motions',
    type: 'Digestive',
    mainDosha: 'Pitta-Vata',
    commonMedicines: ['Kutaj Churna', 'Bilva Churna', 'Abhayarishta', 'Kamdudha Ras', 'Sudarshan Vati'],
    pathya: 'ORS, rice water, pomegranate juice, buttermilk, banana, tender coconut, rest',
    apathya: 'Heavy food, spicy food, fried items, cold food, milk, raw vegetables, stress',
    description: 'Frequent loose or watery stools causing dehydration and electrolyte imbalance.',
  },
  {
    name: 'Shotha',
    localName: 'Edema / Generalized Swelling',
    type: 'Systemic',
    mainDosha: 'Kapha',
    commonMedicines: ['Punarnavadi Guggulu', 'Punarnavasava', 'Gokshuradi Guggulu', 'Varanadi Kwath', 'Arogyavardhini Vati'],
    pathya: 'Light food, low salt diet, barley, horse gram, dry ginger, bitter gourd, exercise',
    apathya: 'Salt, sweet food, cold food, sedentary lifestyle, cold water, milk, curd',
    description: 'Abnormal accumulation of fluid in tissues causing swelling of legs, face or abdomen.',
  },
  {
    name: 'Hridroga',
    localName: 'Cardiac Disorders / Heart Disease',
    type: 'Cardiac',
    mainDosha: 'Vata-Kapha',
    commonMedicines: ['Arjuna Capsule', 'Dashamoolarishta', 'Brahmi Vati', 'Sarpagandha Vati', 'Yograj Guggulu'],
    pathya: 'Light diet, arjuna bark tea, pomegranate, garlic, ginger, walking, yoga, stress management',
    apathya: 'Heavy fatty food, excess salt, alcohol, smoking, stress, sedentary life, fried food',
    description: 'Disorders of the heart including hypertension, angina and cardiac arrhythmias.',
  },
  {
    name: 'Gridhrasi',
    localName: 'Sciatica / Lumbar Radiculopathy',
    type: 'Neurological',
    mainDosha: 'Vata',
    commonMedicines: ['Maharasnadi Kwath', 'Yograj Guggulu', 'Dashamoolarishta', 'Dhanwantaram Taila', 'Sahacharadi Kwath'],
    pathya: 'Warm oil massage, gentle stretching, warm food, rest, Kati Basti therapy, warm compress',
    apathya: 'Cold food, sitting for long hours, bending suddenly, lifting heavy weight, cold exposure',
    description: 'Sciatic nerve pain radiating from lower back through buttock down the leg.',
  },
  {
    name: 'Vatavyadhi',
    localName: 'Neurological Disorders / Neuropathy',
    type: 'Neurological',
    mainDosha: 'Vata',
    commonMedicines: ['Ashwagandha Churna', 'Brahmi Vati', 'Dashmoola Kwath', 'Saraswatarishta', 'Bala Taila'],
    pathya: 'Warm oil massage (Abhyanga), warm food, adequate rest, meditation, yoga, warm milk',
    apathya: 'Cold food, fasting, excessive exertion, cold exposure, irregular sleep, stress',
    description: 'Disorders caused by Vata imbalance affecting nervous system and movement.',
  },
  {
    name: 'Udarda',
    localName: 'Urticaria / Hives / Allergic Rash',
    type: 'Dermatological',
    mainDosha: 'Pitta-Kapha',
    commonMedicines: ['Haridrakhand Vati', 'Haridra (Turmeric)', 'Kaishor Guggulu', 'Neem Capsule', 'Arogyavardhini Vati'],
    pathya: 'Anti-allergic foods, coconut, pomegranate, turmeric milk, neem juice, cooling diet',
    apathya: 'Seafood, milk + fish combination, incompatible foods, alcohol, spicy food, allergens',
    description: 'Allergic skin reaction with itchy raised welts (hives) that appear and disappear.',
  },
  {
    name: 'Raktapitta',
    localName: 'Bleeding Disorders / Hemorrhagic Conditions',
    type: 'Hematological',
    mainDosha: 'Pitta',
    commonMedicines: ['Praval Pishti', 'Kamdudha Ras', 'Chandanasava', 'Mukta Pishti', 'Usheerasava'],
    pathya: 'Cooling foods, pomegranate, coconut water, milk, ghee, sugarcane juice, rest',
    apathya: 'Spicy hot food, alcohol, sun exposure, physical exertion, sour food, sesame',
    description: 'Bleeding from various body openings due to elevated Pitta affecting blood.',
  },
  {
    name: 'Pradara',
    localName: 'Leucorrhoea / Vaginal Discharge',
    type: 'Gynecological',
    mainDosha: 'Kapha-Pitta',
    commonMedicines: ['Pushyanug Churna', 'Chandraprabha Vati', 'Lodhrasava', 'Ashoka Capsule', 'Kumaryasava'],
    pathya: 'Light diet, hygiene, curd rice, pomegranate, astringent foods, yoga, adequate rest',
    apathya: 'Sour foods, fermented food, sweet food, excess sitting, stress, poor hygiene',
    description: 'Excessive white or colored vaginal discharge indicating reproductive tract imbalance.',
  },
  {
    name: 'Artava Kshaya',
    localName: 'PCOS / Oligomenorrhea / Scanty Periods',
    type: 'Gynecological',
    mainDosha: 'Vata-Kapha',
    commonMedicines: ['Shatavari Churna', 'Dashamoolarishta', 'Kanchanar Guggulu', 'Chandraprabha Vati', 'Kumaryasava'],
    pathya: 'Warm foods, sesame, castor oil therapy, yoga, stress management, regular sleep cycle',
    apathya: 'Cold food, suppressing natural urges, stress, sedentary lifestyle, excessive exercise',
    description: 'Scanty, irregular or absent menstruation due to hormonal imbalance.',
  },
  {
    name: 'Shukrameha',
    localName: 'Male Reproductive Disorders / Sexual Debility',
    type: 'Reproductive',
    mainDosha: 'Vata',
    commonMedicines: ['Musali Churna', 'Ashwagandha Churna', 'Balarishta', 'Vasant Kusumakar Ras', 'Tentex Royal'],
    pathya: 'Milk, ghee, almonds, dates, sesame seeds, adequate rest, meditation, yoga',
    apathya: 'Excessive sexual activity, alcohol, smoking, stress, irregular sleep, fasting',
    description: 'Male reproductive disorders including premature ejaculation and low sperm count.',
  },
  {
    name: 'Vatarakta',
    localName: 'Gout / Hyperuricemia',
    type: 'Musculoskeletal',
    mainDosha: 'Vata-Pitta',
    commonMedicines: ['Kaishor Guggulu', 'Amritarishta', 'Guduchi (Giloy) Vati', 'Punarnavasava', 'Triphala Churna'],
    pathya: 'Coconut water, pomegranate, cherry juice, plenty of water, alkaline foods, rest',
    apathya: 'Red meat, seafood, alcohol, lentils, spinach, cauliflower, tomato, dehydration',
    description: 'Inflammatory arthritis caused by uric acid crystal deposition in joints.',
  },
  {
    name: 'Kasa-Shwasa',
    localName: 'Cough with Breathlessness / Upper Respiratory Infection',
    type: 'Respiratory',
    mainDosha: 'Kapha-Vata',
    commonMedicines: ['Sitopaladi Churna', 'Trikatu Churna', 'Tribhuvankirti Ras', 'Septilin', 'Vasavaleha'],
    pathya: 'Warm foods, ginger-honey-lemon tea, steam inhalation, tulsi, nasal irrigation, rest',
    apathya: 'Cold food and drinks, dairy, banana, dust, cold weather, smoking, allergens',
    description: 'Combined respiratory condition with productive cough and difficulty breathing.',
  },
  {
    name: 'Agnisara',
    localName: 'Obesity / Weight Management',
    type: 'Metabolic',
    mainDosha: 'Kapha',
    commonMedicines: ['Triphala Guggulu', 'Medohar Guggulu', 'Arogyavardhini Vati', 'Trikatu Churna', 'Varanadi Kwath'],
    pathya: 'Low carb diet, barley, horse gram, bitter vegetables, warm water with honey-lemon, exercise',
    apathya: 'Sugar, sweets, rice, potato, excess eating, sedentary lifestyle, excess sleep, cold food',
    description: 'Excessive accumulation of body fat (Meda dhatu) leading to weight gain and metabolic issues.',
  },
  {
    name: 'Unmada',
    localName: 'Anxiety / Depression / Mental Disorders',
    type: 'Psychiatric',
    mainDosha: 'Vata-Pitta',
    commonMedicines: ['Brahmi Vati', 'Saraswatarishta', 'Shankhapushpi Churna', 'Jatamansi Churna', 'Mentat'],
    pathya: 'Meditation, yoga, pranayama, warm milk with brahmi, regular sleep, social support',
    apathya: 'Stress, irregular lifestyle, excess screen time, alcohol, stimulants, isolation',
    description: 'Mental disturbances including anxiety, depression, mood disorders and memory issues.',
  },
];

// ─── SEED FUNCTION ────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI, { dbName: 'ayurclinic' });
  console.log('✅ Connected — database: ayurclinic\n');

  // ── Seed Medicines ──
  console.log('💊 Seeding medicines...');
  let medAdded = 0, medSkipped = 0;
  for (const med of MEDICINES) {
    const exists = await Inventory.findOne({ medicineName: med.medicineName });
    if (exists) { medSkipped++; continue; }
    await new Inventory(med).save();
    medAdded++;
  }
  console.log(`   ✅ Medicines: ${medAdded} added, ${medSkipped} already existed`);
  console.log(`   📦 Total medicines in DB: ${await Inventory.countDocuments()}\n`);

  // ── Seed Diseases ──
  console.log('🏥 Seeding diseases...');
  let diseaseAdded = 0, diseaseSkipped = 0;
  for (const disease of DISEASES) {
    const exists = await Disease.findOne({ name: disease.name });
    if (exists) { diseaseSkipped++; continue; }
    await new Disease(disease).save();
    diseaseAdded++;
  }
  console.log(`   ✅ Diseases: ${diseaseAdded} added, ${diseaseSkipped} already existed`);
  console.log(`   📋 Total diseases in DB: ${await Disease.countDocuments()}\n`);

  console.log('🎉 Seeding complete!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
