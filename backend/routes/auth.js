const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Dolgozok } = require('../database');
const { Op } = require('sequelize');


// Register a new user
router.post('/register', async (req, res) => {
    const { DNev, Email, Telefonszam, Nem, Munkakor, Admin, FelhasznaloNev, Jelszo } = req.body;

    try {
        // Check if user already exists
        const existingUser = await Dolgozok.findOne({
            where: {
                [Op.or]: [{ FelhasznaloNev: FelhasznaloNev }, { Email: Email }]
            }
        });
        if (existingUser) {
            return res.status(400).json({ "error": "FelhasznaloNev or Email already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const JelszoHash = await bcrypt.hash(Jelszo, salt);

        const newUser = await Dolgozok.create({
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
            "message": "User registered successfully",
            "data": { DID: newUser.DID, FelhasznaloNev: newUser.FelhasznaloNev }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { FelhasznaloNev, Jelszo } = req.body;

    try {
        const user = await Dolgozok.findOne({ where: { FelhasznaloNev } });
        if (!user) {
            return res.status(400).json({ "message": "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(Jelszo, user.JelszoHash);
        if (!isMatch) {
            return res.status(400).json({ "message": "Invalid Credentials" });
        }

        const payload = {
            user: {
                id: user.DID,
                username: user.FelhasznaloNev,
                Admin: user.Admin,
                Munkakor: user.Munkakor
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
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;