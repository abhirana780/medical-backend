const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Upload a new prescription
// @route   POST /api/prescriptions
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { imageUrl, notes } = req.body;

        const prescription = await Prescription.create({
            user: req.user._id,
            imageUrl,
            notes
        });

        res.status(201).json(prescription);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get all prescriptions (Admin)
// @route   GET /api/prescriptions
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const prescriptions = await Prescription.find({})
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update prescription status
// @route   PUT /api/prescriptions/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        const prescription = await Prescription.findById(req.params.id);

        if (prescription) {
            prescription.status = status;
            const updatedPrescription = await prescription.save();
            res.json(updatedPrescription);
        } else {
            res.status(404).json({ message: 'Prescription not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete a prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const result = await Prescription.deleteOne({ _id: req.params.id });

        if (result.deletedCount > 0) {
            res.json({ message: 'Prescription removed' });
        } else {
            res.status(404).json({ message: 'Prescription not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
