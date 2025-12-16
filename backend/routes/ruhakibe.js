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

// Middleware to check if user is Manager or Admin
const isManagerOrAdmin = (req, res, next) => {
    if (req.user && (req.user.munkakor === 'Manager' || req.user.admin === 1)) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Manager or Admin role required' });
    }
};

// Get all check-ins/check-outs (Manager and Admin)
router.get('/', (req, res) => {
    db.all('SELECT * FROM RuhaKiBe', [], (err, rows) => {
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

// Get a single check-in/check-out by KiadasID (Manager and Admin)
router.get('/:kiadasid', (req, res) => {
    const { kiadasid } = req.params;
    db.get('SELECT * FROM RuhaKiBe WHERE KiadasID = ?', [kiadasid], (err, row) => {
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
            res.status(404).json({"message": "Check-in/Check-out record not found"});
        }
    });
});

// Create a new check-in/check-out record (Manager and Admin)
router.post('/', isManagerOrAdmin, (req, res) => {
    const { DID, KID, KiadasDatum, VisszaDatum, Mennyiseg } = req.body;
    const insert = 'INSERT INTO RuhaKiBe (DID, KID, KiadasDatum, VisszaDatum, Mennyiseg) VALUES (?,?,?,?,?)';
    db.run(insert, [DID, KID, KiadasDatum, VisszaDatum, Mennyiseg], function (err) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.status(201).json({
            "message": "success",
            "data": { KiadasID: this.lastID, ...req.body }
        });
    });
});

// Update a check-in/check-out record (Admin only)
router.patch('/:kiadasid', isAdmin, (req, res) => {
    const { kiadasid } = req.params;
    const { DID, KID, KiadasDatum, VisszaDatum, Mennyiseg } = req.body;
    db.run(
        `UPDATE RuhaKiBe SET
            DID = COALESCE(?,DID),
            KID = COALESCE(?,KID),
            KiadasDatum = COALESCE(?,KiadasDatum),
            VisszaDatum = COALESCE(?,VisszaDatum),
            Mennyiseg = COALESCE(?,Mennyiseg)
            WHERE KiadasID = ?`,
        [DID, KID, KiadasDatum, VisszaDatum, Mennyiseg, kiadasid],
        function (err) {
            if (err) {
                res.status(400).json({"error": err.message});
                return;
            }
            res.json({ "message": "success", "changes": this.changes });
        }
    );
});

// Delete a check-in/check-out record (Admin only)
router.delete('/:kiadasid', isAdmin, (req, res) => {
    const { kiadasid } = req.params;
    db.run(
        'DELETE FROM RuhaKiBe WHERE KiadasID = ?',
        kiadasid,
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
