const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // 1. Recalculate prices from DB to prevent fraud
        let itemsFromDB = [];
        let subtotal = 0;

        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.name}` });
            }

            // Push verified item structure
            itemsFromDB.push({
                product: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                qty: item.qty
            });

            subtotal += product.price * item.qty;
        }

        // 2. Calculate Shipping (Simple logic: > $300 is free, else $25)
        // You can make this more complex or customizable later
        const shippingPrice = subtotal > 300 ? 0 : 25;
        const taxPrice = 0; // Add tax logic if needed
        const totalPrice = subtotal + shippingPrice + taxPrice;

        const order = new Order({
            user: req.user._id, // Securely get user from token
            orderItems: itemsFromDB,
            shippingAddress,
            paymentMethod,
            itemsPrice: subtotal,
            taxPrice,
            shippingPrice,
            totalPrice
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);

    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id firstName lastName');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');

        if (order) {
            // Ensure user can only see their own order (unless admin)
            if (req.user.isAdmin || order.user._id.equals(req.user._id)) {
                res.json(order);
            } else {
                res.status(401).json({ message: 'Not authorized to view this order' });
            }
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email_address,
            };

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put('/:id/deliver', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isDelivered = true;
            order.deliveredAt = Date.now();

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Track order public
// @route   POST /api/orders/track
// @access  Public
router.post('/track', async (req, res) => {
    try {
        const { orderId, email } = req.body;

        try {
            const order = await Order.findById(orderId).populate('user', 'email');

            if (order) {
                // Check if email matches the user who placed the order
                if (order.user && order.user.email.toLowerCase() === email.toLowerCase()) {
                    return res.json({
                        _id: order._id,
                        createdAt: order.createdAt,
                        isPaid: order.isPaid,
                        isDelivered: order.isDelivered,
                        deliveredAt: order.deliveredAt,
                        totalPrice: order.totalPrice,
                        orderItems: order.orderItems,
                        status: order.isDelivered ? 'Delivered' : order.isPaid ? 'Processing' : 'Pending Payment'
                    });
                }
            }

            res.status(404).json({ message: 'Order not found or email does not match.' });

        } catch (err) {
            res.status(404).json({ message: 'Order not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
