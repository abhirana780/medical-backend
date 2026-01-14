const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./src/models/Product');

dotenv.config();

const fixData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medical_store');
        console.log('MongoDB Connected');

        console.log('Deleting all products to force re-seed...');
        await Product.deleteMany({});
        console.log('All products deleted.');

        // We can let the main server re-seed, or do it here. 
        // Let's let the main server do it on next restart to keep logic centralized.

        console.log('Done. Please restart your backend server now.');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixData();
