const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const productsData = require('./data/products');
const Product = require('./models/Product');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medical_store')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Seed Database
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        // Seed Products
        const count = await Product.countDocuments();
        if (count < 10) {
            await Product.deleteMany({});
            await Product.insertMany(productsData);
            console.log('Database Re-Seeded with Full Content!');
        }

        // Seed Admin User
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('123456', salt);

            await User.create({
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
                password: hashedPassword,
                isAdmin: true
            });
            console.log('Default Admin User Created: admin@example.com / 123456');
        }
    } catch (error) {
        console.log('Seed Error:', error);
    }
};

mongoose.connection.once('open', seedDatabase);

const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
// Ensure uploads directory exists (Only locally)
const uploadDir = path.join(__dirname, '../uploads');
if (!process.env.VERCEL) {  // Skip directory creation on Vercel
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/inquiries', require('./routes/inquiryRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));

// Make uploads folder static
app.use('/uploads', express.static(uploadDir));

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
