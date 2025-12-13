import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/iso15939_db";

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log("Connected to MongoDB for seeding...");

        const existing = await User.findOne({ username: 'testuser' });
        if (existing) {
            console.log("Test user already exists.");
            await mongoose.disconnect();
            return;
        }

        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = new User({
            username: 'testuser',
            password: hashedPassword
        });

        await user.save();
        console.log("Test user created: testuser / password123");
        await mongoose.disconnect();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
