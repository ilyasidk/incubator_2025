const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
    console.log('--- Received /register request ---');
    console.log('Request body:', req.body);
    try {
        console.log('Inside TRY block for /register');
        const { email, password } = req.body;

        console.log('Checking if user exists:', email);
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }
        console.log('User does not exist, proceeding...');

        console.log('Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        console.log('Password hashed.');

        console.log('Creating new user object...');
        const newUser = new User({
            email,
            passwordHash
        });
        console.log('New user object created:', newUser);

        console.log('Attempting to save user...');
        await newUser.save();
        console.log('User saved successfully:', newUser._id);

        console.log('Generating JWT...');
        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        console.log('JWT generated.');

        res.status(201).json({
            message: 'User registered successfully',
            token
        });
        console.log('--- Successfully processed /register request ---');
    } catch (error) {
        console.error('!!! Registration error in CATCH block:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;