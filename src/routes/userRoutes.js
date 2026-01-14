const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
router.get('/wishlist', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        // Since product IDs are strings in Product model but referenced as ObIds usually? 
        // Actually Product model has _id: String. Mongoose populate works if ref matches.
        // But if IDs are strings, we need to ensure localField/foreignField match if automatic mapping fails.
        // Let's assume standard populate works for now, if not we will fix.

        // Actually, if Product _id is String, Mongoose might not populate efficiently if stored as String in array without manual schema config.
        // Let's manually fetch if needed, but populate is cleaner.
        // To be safe given previous "String _id" usage:

        const wishlistProducts = await require('../models/Product').find({
            _id: { $in: user.wishlist }
        });

        res.json(wishlistProducts);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Add to wishlist
// @route   POST /api/users/wishlist/:id
// @access  Private
router.post('/wishlist/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const productId = req.params.id;

        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
        }

        res.json({ message: 'Product added to wishlist' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Remove from wishlist
// @route   DELETE /api/users/wishlist/:id
// @access  Private
router.delete('/wishlist/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const productId = req.params.id;

        user.wishlist = user.wishlist.filter(id => id !== productId);
        await user.save();

        res.json({ message: 'Product removed from wishlist' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
router.post('/addresses', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const newAddress = {
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            postalCode: req.body.postalCode,
            country: req.body.country,
            isDefault: req.body.isDefault || false
        };

        if (newAddress.isDefault) {
            // Set all other addresses to false
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push(newAddress);
        await user.save();

        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
router.delete('/addresses/:addressId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        user.addresses = user.addresses.filter(
            (addr) => addr._id.toString() !== req.params.addressId
        );

        await user.save();
        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
