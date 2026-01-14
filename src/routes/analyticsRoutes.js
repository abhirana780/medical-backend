const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get dashboard stats
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
router.get('/dashboard', protect, admin, async (req, res) => {
    try {
        // Parallel fetching for speed
        const [
            ordersCount,
            productsCount,
            usersCount,
            totalSalesAgg,
            recentOrders,
            lowStockCount,
            lowStockProducts
        ] = await Promise.all([
            Order.countDocuments(),
            Product.countDocuments(),
            User.countDocuments(),
            Order.aggregate([
                { $match: { isPaid: true } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]),
            Order.find({})
                .populate('user', 'firstName lastName')
                .sort({ createdAt: -1 })
                .limit(5),
            Product.countDocuments({ countInStock: { $lt: 10 } }),
            Product.find({ countInStock: { $lt: 10 } }).select('name countInStock').limit(5)
        ]);

        const totalSales = totalSalesAgg[0] ? totalSalesAgg[0].total : 0;

        res.json({
            ordersCount,
            productsCount,
            usersCount,
            totalSales,
            recentOrders,
            lowStockCount,
            lowStockProducts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
