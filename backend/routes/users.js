const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Note = require('../models/Note');
const { authMiddleware } = require('../middleware/auth');

// Get user profile
router.get('/profile/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('-password -email -mobileNumber')
            .populate({
                path: 'uploadedNotes',
                select: 'title subject class createdAt downloadCount views',
                options: { sort: { createdAt: -1 }, limit: 10 }
            });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Get user's uploaded notes
router.get('/notes', authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const notes = await Note.find({ uploadedBy: req.userId })
            .sort('-createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const count = await Note.countDocuments({ uploadedBy: req.userId });

        res.json({
            notes,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalNotes: count
        });
    } catch (error) {
        console.error('User notes error:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// Get user's downloaded notes
router.get('/downloads', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate({
                path: 'downloadedNotes.noteId',
                select: 'title subject class fileUrl uploadedBy',
                populate: {
                    path: 'uploadedBy',
                    select: 'firstName lastName username'
                }
            });

        const downloads = user.downloadedNotes.map(download => ({
            note: download.noteId,
            downloadedAt: download.downloadedAt
        }));

        res.json(downloads);
    } catch (error) {
        console.error('Downloads error:', error);
        res.status(500).json({ error: 'Failed to fetch downloads' });
    }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const allowedUpdates = ['firstName', 'lastName', 'qualification'];
        const updates = {};

        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.userId,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get user statistics
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        const uploadedNotesCount = await Note.countDocuments({ uploadedBy: req.userId });
        const totalDownloads = await Note.aggregate([
            { $match: { uploadedBy: req.userId } },
            { $group: { _id: null, total: { $sum: '$downloadCount' } } }
        ]);
        const totalViews = await Note.aggregate([
            { $match: { uploadedBy: req.userId } },
            { $group: { _id: null, total: { $sum: '$views' } } }
        ]);
        const totalLikes = await Note.aggregate([
            { $match: { uploadedBy: req.userId } },
            { $group: { _id: null, total: { $sum: { $size: '$likes' } } } }
        ]);

        res.json({
            uploadedNotes: uploadedNotesCount,
            downloadedNotes: user.downloadedNotes.length,
            totalDownloads: totalDownloads[0]?.total || 0,
            totalViews: totalViews[0]?.total || 0,
            totalLikes: totalLikes[0]?.total || 0
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

module.exports = router;