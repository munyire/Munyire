const express = require('express');
const router = express.Router();
const { Dolgozok } = require('../database');
const bcrypt = require('bcryptjs');


// Middleware to check if user is Admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.Admin === 1) { // Note: Sequelize might return capitalized field names
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Admin role required' });
    }
};

// Get all employees
router.get('/', async (req, res) => {
    try {
        const dolgozok = await Dolgozok.findAll();
        res.json({
            "message": "success",
            "data": dolgozok
        });
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

// Get a single employee by DolgozoID
router.get('/:dolgozoId', async (req, res) => {
    try {
        const dolgozo = await Dolgozok.findByPk(req.params.dolgozoId);
        if (dolgozo) {
            res.json({
                "message": "success",
                "data": dolgozo
            });
        } else {
            res.status(404).json({ "message": "Employee not found" });
        }
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

// Create a new employee (Admin only)
router.post('/', isAdmin, async (req, res) => {
    try {
        const { DNev, Email, Telefonszam, Nem, Munkakor, Admin, FelhasznaloNev, Jelszo } = req.body;
        if (!Jelszo) {
            return res.status(400).json({ "error": "Password is required" });
        }
        const JelszoHash = await bcrypt.hash(Jelszo, 10);
        
        const newDolgozo = await Dolgozok.create({
            DNev,
            Email,
            Telefonszam,
            Nem,
            Munkakor,
            Admin,
            FelhasznaloNev,
            JelszoHash
        });
        res.status(201).json({
            "message": "success",
            "data": newDolgozo
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Update an employee (Admin only)
router.patch('/:dolgozoId', isAdmin, async (req, res) => {
    try {
        const { Jelszo, ...updateData } = req.body;

        if (Jelszo) {
            updateData.JelszoHash = await bcrypt.hash(Jelszo, 10);
        }

        const [updated] = await Dolgozok.update(updateData, {
            where: { DolgozoID: req.params.dolgozoId }
        });

        if (updated) {
            res.json({ "message": "success", "changes": updated });
        } else {
            res.status(404).json({ "message": "Employee not found" });
        }
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Delete an employee (Admin only)
router.delete('/:dolgozoId', isAdmin, async (req, res) => {
    try {
        const deleted = await Dolgozok.destroy({
            where: { DolgozoID: req.params.dolgozoId }
        });

        if (deleted) {
            res.json({ "message": "deleted", "changes": deleted });
        } else {
            res.status(404).json({ "message": "Employee not found" });
        }
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

module.exports = router;
