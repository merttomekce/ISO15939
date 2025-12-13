import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_do_not_use_in_production";

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Simple validation
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        // Check text exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });

    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ error: "Server error during registration" });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Generate Token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, username: user.username });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Server error during login" });
    }
});

export default router;
