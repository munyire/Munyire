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

// Get all employees (Manager and Admin)
router.get('/', (req, res) => {
    db.all('SELECT * FROM Dolgozok', [], (err, rows) => {
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

// Get a single employee by DID (Manager and Admin)
router.get('/:did', (req, res) => {
    const { did } = req.params;
    db.get('SELECT * FROM Dolgozok WHERE DID = ?', [did], (err, row) => {
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
            res.status(404).json({"message": "Employee not found"});
        }
    });
});

// Create a new employee (Admin only)
router.post('/', isAdmin, (req, res) => {
    const { DNev, Email, Telefonszam, Nem, Munkakor, Admin, FelhasznaloNev, JelszoHash } = req.body;
    const insert = 'INSERT INTO Dolgozok (DNev, Email, Telefonszam, Nem, Munkakor, Admin, FelhasznaloNev, JelszoHash) VALUES (?,?,?,?,?,?,?,?)';
    db.run(insert, [DNev, Email, Telefonszam, Nem, Munkakor, Admin, FelhasznaloNev, JelszoHash], function (err) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.status(201).json({
            "message": "success",
            "data": { DID: this.lastID, ...req.body }
        });
    });
});

// Update an employee (Admin only)
router.put('/:did', isAdmin, (req, res) => {
    const { did } = req.params;
    const { DNev, Email, Telefonszam, Nem, Munkakor, Admin, FelhasznaloNev, JelszoHash } = req.body;
    db.run(
        `UPDATE Dolgozok SET
            DNev = COALESCE(?,DNev),
            Email = COALESCE(?,Email),
            Telefonszam = COALESCE(?,Telefonszam),
            Nem = COALESCE(?,Nem),
            Munkakor = COALESCE(?,Munkakor),
            Admin = COALESCE(?,Admin),
            FelhasznaloNev = COALESCE(?,FelhasznaloNev),
            JelszoHash = COALESCE(?,JelszoHash)
            WHERE DID = ?`,
        [DNev, Email, Telefonszam, Nem, Munkakor, Admin, FelhasznaloNev, JelszoHash, did],
        function (err) {
            if (err) {
                res.status(400).json({"error": err.message});
                return;
            }
            res.json({ "message": "success", "changes": this.changes });
        }
    );
});

// Delete an employee (Admin only)
router.delete('/:did', isAdmin, (req, res) => {
    const { did } = req.params;
    db.run(
        'DELETE FROM Dolgozok WHERE DID = ?',
        did,
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
