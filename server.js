const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define User model
const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    mobile: String,
    password: String
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Handle form submission
app.post('/register', async (req, res) => {
    const { name, email, mobile, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.send('<h1>Passwords do not match.</h1><a href="/">Go back</a>');
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.send('<h1>User already registered.</h1><a href="/">Go back</a>');
        }

        const newUser = new User({ name, email, mobile, password });
        await newUser.save();
        res.send('<h1>Registration successful!</h1><a href="/">Go back</a>');
    } catch (err) {
        console.error('Error saving user:', err);
        res.send('<h1>An error occurred.</h1><a href="/">Go back</a>');
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
