const express = require('express');
const router = express.Router();
const db = require('../database');

// Middleware to check if user is Admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.admin === 1) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Admin role required' });
    }
};

// Get all clothes (Manager and Admin)
router.get('/', (req, res) => {
    db.all('SELECT * FROM Ruhak', [], (err, rows) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Get a single piece of clothing by KID (Manager and Admin)
router.get('/:kid', (req, res) => {
    const { kid } = req.params;
    db.get('SELECT * FROM Ruhak WHERE KID = ?', [kid], (err, row) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        if (row) {
            res.json({
                "message": "success",
                "data": row
            });
        } else {
            res.status(404).json({"message": "Clothing item not found"});
        }
    });
});

// Create a new clothing item (Admin only)
router.post('/', isAdmin, (req, res) => {
    const { Fajta, Szin, Meret, Mennyiseg } = req.body;
    const insert = 'INSERT INTO Ruhak (Fajta, Szin, Meret, Mennyiseg) VALUES (?,?,?,?)';
    db.run(insert, [Fajta, Szin, Meret, Mennyiseg], function (err) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.status(201).json({
            "message": "success",
            "data": { KID: this.lastID, ...req.body }
        });
    });
});

// Update a clothing item (Admin only)
router.patch('/:kid', isAdmin, (req, res) => {
    const { kid } = req.params;
    const { Fajta, Szin, Meret, Mennyiseg } = req.body;
    db.run(
        `UPDATE Ruhak SET
            Fajta = COALESCE(?,Fajta),
            Szin = COALESCE(?,Szin),
            Meret = COALESCE(?,Meret),
            Mennyiseg = COALESCE(?,Mennyiseg)
            WHERE KID = ?`,
        [Fajta, Szin, Meret, Mennyiseg, kid],
        function (err) {
            if (err) {
                res.status(400).json({"error": err.message});
                return;
            }
            res.json({ "message": "success", "changes": this.changes });
        }
    );
});

// Delete a clothing item (Admin only)
router.delete('/:kid', isAdmin, (req, res) => {
    const { kid } = req.params;
    db.run(
        'DELETE FROM Ruhak WHERE KID = ?',
        kid,
        function (err) {
            if (err) {
                res.status(400).json({"error": err.message});
                return;
            }
            res.json({ "message": "deleted", "changes": this.changes });
        }
    );
});

module.exports = router;
