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

// Get all orders (Manager and Admin)
router.get('/', (req, res) => {
    db.all('SELECT * FROM Rendelesek', [], (err, rows) => {
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

// Get a single order by RID (Manager and Admin)
router.get('/:rid', (req, res) => {
    const { rid } = req.params;
    db.get('SELECT * FROM Rendelesek WHERE RID = ?', [rid], (err, row) => {
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
            res.status(404).json({"message": "Order not found"});
        }
    });
});

// Create a new order (Manager and Admin)
router.post('/', isManagerOrAdmin, (req, res) => {
    const { KID, RDatum, Mennyiseg } = req.body;
    const insert = 'INSERT INTO Rendelesek (KID, RDatum, Mennyiseg) VALUES (?,?,?)';
    db.run(insert, [KID, RDatum, Mennyiseg], function (err) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.status(201).json({
            "message": "success",
            "data": { RID: this.lastID, ...req.body }
        });
    });
});

// Update an order (Manager and Admin)
router.put('/:rid', isManagerOrAdmin, (req, res) => {
    const { rid } = req.params;
    const { KID, RDatum, Mennyiseg } = req.body;
    db.run(
        `UPDATE Rendelesek SET
            KID = COALESCE(?,KID),
            RDatum = COALESCE(?,RDatum),
            Mennyiseg = COALESCE(?,Mennyiseg)
            WHERE RID = ?`,
        [KID, RDatum, Mennyiseg, rid],
        function (err) {
            if (err) {
                res.status(400).json({"error": err.message});
                return;
            }
            res.json({ "message": "success", "changes": this.changes });
        }
    );
});

// Delete an order (Admin only)
router.delete('/:rid', isAdmin, (req, res) => {
    const { rid } = req.params;
    db.run(
        'DELETE FROM Rendelesek WHERE RID = ?',
        rid,
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
