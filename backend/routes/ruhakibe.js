const express = require('express');
const router = express.Router();
const { RuhaKiBe } = require('../database');

// Middleware to check if user is Admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.Admin === 1) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Admin role required' });
    }
};

// Middleware to check if user is Manager or Admin
const isManagerOrAdmin = (req, res, next) => {
    if (req.user && (req.user.Munkakor === 'Manager' || req.user.Admin === 1)) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Manager or Admin role required' });
    }
};

// Get all check-ins/check-outs
router.get('/', async (req, res) => {
    try {
        const records = await RuhaKiBe.findAll();
        res.json({
            "message": "success",
            "data": records
        });
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

// Get a single check-in/check-out by KiadasID
router.get('/:kiadasid', async (req, res) => {
    try {
        const record = await RuhaKiBe.findByPk(req.params.kiadasid);
        if (record) {
            res.json({
                "message": "success",
                "data": record
            });
        } else {
            res.status(404).json({ "message": "Check-in/Check-out record not found" });
        }
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

// Create a new check-in/check-out record (Manager or Admin)
router.post('/', isManagerOrAdmin, async (req, res) => {
    try {
        const newRecord = await RuhaKiBe.create(req.body);
        res.status(201).json({
            "message": "success",
            "data": newRecord
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Update a check-in/check-out record (Admin only)
router.patch('/:kiadasid', isAdmin, async (req, res) => {
    try {
        const [updated] = await RuhaKiBe.update(req.body, {
            where: { KiadasID: req.params.kiadasid }
        });

        if (updated) {
            res.json({ "message": "success", "changes": updated });
        } else {
            res.status(404).json({ "message": "Check-in/Check-out record not found" });
        }
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Delete a check-in/check-out record (Admin only)
router.delete('/:kiadasid', isAdmin, async (req, res) => {
    try {
        const deleted = await RuhaKiBe.destroy({
            where: { KiadasID: req.params.kiadasid }
        });

        if (deleted) {
            res.json({ "message": "deleted", "changes": deleted });
        } else {
            res.status(404).json({ "message": "Check-in/Check-out record not found" });
        }
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

module.exports = router;