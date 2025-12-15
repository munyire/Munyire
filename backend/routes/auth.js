const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

// Register a new user
router.post('/register', async (req, res) => {
    const { DNev, Email, Telefonszam, Nem, Munkakor, Admin, FelhasznaloNev, Jelszo } = req.body;

    try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const JelszoHash = await bcrypt.hash(Jelszo, salt);

        const insert = 'INSERT INTO Dolgozok (DNev, Email, Telefonszam, Nem, Munkakor, Admin, FelhasznaloNev, JelszoHash) VALUES (?,?,?,?,?,?,?,?)';
        db.run(insert, [DNev, Email, Telefonszam, Nem, Munkakor, Admin, FelhasznaloNev, JelszoHash], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({"error": "FelhasznaloNev or Email already exists"});
                }
                return res.status(500).json({"error": err.message});
            }
            res.status(201).json({
                "message": "User registered successfully",
                "data": { DID: this.lastID, FelhasznaloNev }
            });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login user
router.post('/login', (req, res) => {
    const { FelhasznaloNev, Jelszo } = req.body;

    db.get('SELECT * FROM Dolgozok WHERE FelhasznaloNev = ?', [FelhasznaloNev], async (err, user) => {
        if (err) {
            return res.status(500).json({"error": err.message});
        }
        if (!user) {
            return res.status(400).json({"message": "Invalid Credentials"});
        }

        const isMatch = await bcrypt.compare(Jelszo, user.JelszoHash);
        if (!isMatch) {
            return res.status(400).json({"message": "Invalid Credentials"});
        }

        const payload = {
            user: {
                id: user.DID,
                username: user.FelhasznaloNev,
                admin: user.Admin,
                munkakor: user.Munkakor
            }
        };

        jwt.sign(
            payload,
            "supersecretjwtkey", // This should be in an environment variable
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    });
});

module.exports = router;
