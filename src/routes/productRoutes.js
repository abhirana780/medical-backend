const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
    const { search, category, brand, rating, minPrice, maxPrice, inStock, sort } = req.query;

    try {
        let query = {};

        if (category && category !== 'All') {
            query.category = category;
        }

        if (brand) {
            query.brand = brand;
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (rating) {
            query.rating = { $gte: Number(rating) };
        }

        if (inStock === 'true') {
            query.countInStock = { $gt: 0 };
        }

        let sortOption = {};
        if (sort === 'priceAsc') {
            sortOption.price = 1;
        } else if (sort === 'priceDesc') {
            sortOption.price = -1;
        } else if (sort === 'newest') {
            sortOption.createdAt = -1;
        }

        const limit = req.query.limit ? parseInt(req.query.limit) : 0;
        const products = await Product.find(query).sort(sortOption).limit(limit);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get top reviews
// @route   GET /api/products/reviews/top
// @access  Public
router.get('/reviews/top', async (req, res) => {
    try {
        const reviews = await Product.aggregate([
            { $match: { reviews: { $exists: true, $ne: [] } } },
            { $unwind: '$reviews' },
            { $sort: { 'reviews.createdAt': -1 } },
            { $limit: 6 },
            {
                $project: {
                    _id: 0,
                    productName: '$name',
                    productImage: '$image',
                    name: '$reviews.name',
                    rating: '$reviews.rating',
                    comment: '$reviews.comment',
                    createdAt: '$reviews.createdAt',
                }
            }
        ]);
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching top reviews:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, price, description, image, category, countInStock } = req.body;

        const product = new Product({
            _id: new mongoose.Types.ObjectId().toString(), // Or let Mongo generate it if you switch schema to ObjectId
            name: name || 'Sample Name',
            price: price || 0,
            user: req.user._id,
            image: image || '/images/sample.jpg',
            category: category || 'Sample Category',
            countInStock: countInStock || 0,
            numReviews: 0,
            description: description || 'Sample description',
            isNewArrival: true
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { name, price, description, image, category, countInStock, isNewArrival, isSale } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name !== undefined ? name : product.name;
            product.price = price !== undefined ? price : product.price;
            product.description = description !== undefined ? description : product.description;
            product.image = image !== undefined ? image : product.image;
            product.category = category !== undefined ? category : product.category;
            product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
            product.isNewArrival = isNewArrival !== undefined ? isNewArrival : product.isNewArrival;
            product.isSale = isSale !== undefined ? isSale : product.isSale;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Product already reviewed' });
            }

            const review = {
                name: `${req.user.firstName} ${req.user.lastName}`,
                rating: Number(rating),
                comment,
                user: req.user._id,
            };

            product.reviews.push(review);

            product.numReviews = product.reviews.length;

            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;

            await product.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all reviews (Admin)
// @route   GET /api/products/reviews/all
// @access  Private/Admin
router.get('/reviews/all', protect, admin, async (req, res) => {
    try {
        const products = await Product.find({ 'reviews.0': { $exists: true } }).select('name image reviews');
        let allReviews = [];

        products.forEach(product => {
            product.reviews.forEach(review => {
                allReviews.push({
                    _id: review._id,
                    product: product._id,
                    productName: product.name,
                    productImage: product.image,
                    name: review.name,
                    rating: review.rating,
                    comment: review.comment,
                    user: review.user,
                    createdAt: review.createdAt
                });
            });
        });

        // Sort by newest
        allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(allReviews);
    } catch (error) {
        console.error('Error fetching all reviews:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private/Admin
router.delete('/:id/reviews/:reviewId', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            const review = product.reviews.find(
                (r) => r._id.toString() === req.params.reviewId.toString()
            );

            if (review) {
                product.reviews = product.reviews.filter(
                    (r) => r._id.toString() !== req.params.reviewId.toString()
                );

                product.numReviews = product.reviews.length;
                product.rating =
                    product.reviews.length > 0
                        ? product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                        product.reviews.length
                        : 0;

                await product.save();
                res.json({ message: 'Review removed' });
            } else {
                res.status(404).json({ message: 'Review not found' });
            }
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
