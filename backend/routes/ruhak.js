const express = require('express');
const router = express.Router();
const { Ruhak } = require('../database');

// Middleware to check if user is Admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.Admin === 1) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Admin role required' });
    }
};

// Get all clothes
router.get('/', async (req, res) => {
    try {
        const ruhak = await Ruhak.findAll();
        res.json({
            "message": "success",
            "data": ruhak
        });
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

// Get a single piece of clothing by KID
router.get('/:kid', async (req, res) => {
    try {
        const ruha = await Ruhak.findByPk(req.params.kid);
        if (ruha) {
            res.json({
                "message": "success",
                "data": ruha
            });
        } else {
            res.status(404).json({ "message": "Clothing item not found" });
        }
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

// Create a new clothing item (Admin only)
router.post('/', isAdmin, async (req, res) => {
    try {
        const newRuha = await Ruhak.create(req.body);
        res.status(201).json({
            "message": "success",
            "data": newRuha
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Update a clothing item (Admin only)
router.patch('/:kid', isAdmin, async (req, res) => {
    try {
        const [updated] = await Ruhak.update(req.body, {
            where: { KID: req.params.kid }
        });

        if (updated) {
            res.json({ "message": "success", "changes": updated });
        } else {
            res.status(404).json({ "message": "Clothing item not found" });
        }
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Delete a clothing item (Admin only)
router.delete('/:kid', isAdmin, async (req, res) => {
    try {
        const deleted = await Ruhak.destroy({
            where: { KID: req.params.kid }
        });

        if (deleted) {
            res.json({ "message": "deleted", "changes": deleted });
        } else {
            res.status(404).json({ "message": "Clothing item not found" });
        }
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

module.exports = router;