const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const usersRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clicknotes', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/users', usersRoutes);

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/Notes.html'));
});

app.get('/upload.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/upload.html'));
});

app.get('/download.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/download.html'));
});

app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/about.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.get('/search.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/search.html'));
});

app.get('/note_unit1.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/note_unit1.html'));
});

app.get('/submit.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/submit.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});