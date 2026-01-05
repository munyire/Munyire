const express = require('express');
const router = express.Router();
const { Rendelesek } = require('../database');

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

// Get all orders
router.get('/', async (req, res) => {
    try {
        const rendelesek = await Rendelesek.findAll();
        res.json({
            "message": "success",
            "data": rendelesek
        });
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

// Get a single order by RendelesID
router.get('/:rendelesId', async (req, res) => {
    try {
        const rendeles = await Rendelesek.findByPk(req.params.rendelesId);
        if (rendeles) {
            res.json({
                "message": "success",
                "data": rendeles
            });
        } else {
            res.status(404).json({ "message": "Order not found" });
        }
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

// Create a new order (Manager or Admin)
router.post('/', isManagerOrAdmin, async (req, res) => {
    try {
        const newRendeles = await Rendelesek.create(req.body);
        res.status(201).json({
            "message": "success",
            "data": newRendeles
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Update an order (Manager or Admin)
router.patch('/:rendelesId', isManagerOrAdmin, async (req, res) => {
    try {
        const [updated] = await Rendelesek.update(req.body, {
            where: { RendelesID: req.params.rendelesId }
        });

        if (updated) {
            res.json({ "message": "success", "changes": updated });
        } else {
            res.status(404).json({ "message": "Order not found" });
        }
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Delete an order (Admin only)
router.delete('/:rendelesId', isAdmin, async (req, res) => {
    try {
        const deleted = await Rendelesek.destroy({
            where: { RendelesID: req.params.rendelesId }
        });

        if (deleted) {
            res.json({ "message": "deleted", "changes": deleted });
        } else {
            res.status(404).json({ "message": "Order not found" });
        }
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

module.exports = router;
