const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note');
const User = require('../models/User');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|txt|ppt|pptx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, PPT, PPTX are allowed.'));
        }
    }
});

// Upload note validation
const uploadValidation = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('class').trim().notEmpty().withMessage('Class is required'),
    body('unit').trim().notEmpty().withMessage('Unit is required'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('content').trim().isLength({ min: 50 }).withMessage('Content must be at least 50 characters')
];

// Upload note
router.post('/upload', authMiddleware, upload.single('file'), uploadValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Delete uploaded file if validation fails
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ errors: errors.array() });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'File is required' });
        }

        const { title, subject, class: className, unit, description, content, tags } = req.body;

        // Create note
        const note = new Note({
            title,
            subject,
            class: className,
            unit,
            description,
            content,
            fileUrl: `/uploads/${req.file.filename}`,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            uploadedBy: req.userId,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            readingTime: `${Math.ceil(content.split(' ').length / 200)} min`
        });

        await note.save();

        // Add note to user's uploadedNotes
        await User.findByIdAndUpdate(req.userId, {
            $push: { uploadedNotes: note._id }
        });

        res.status(201).json({
            message: 'Note uploaded successfully',
            note: {
                id: note._id,
                title: note.title,
                subject: note.subject,
                fileUrl: note.fileUrl
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        // Clean up file on error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Get all notes (with pagination and filters)
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { page = 1, limit = 12, subject, class: className, search, sort = '-createdAt' } = req.query;
        
        // Build query
        const query = { isApproved: true };
        
        if (subject) query.subject = subject;
        if (className) query.class = className;
        
        if (search) {
            query.$text = { $search: search };
        }

        // Execute query with pagination
        const notes = await Note.find(query)
            .populate('uploadedBy', 'firstName lastName username')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const count = await Note.countDocuments(query);

        res.json({
            notes,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalNotes: count
        });
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// Get single note
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id)
            .populate('uploadedBy', 'firstName lastName username');

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        // Increment view count
        note.views += 1;
        await note.save();

        res.json(note);
    } catch (error) {
        console.error('Get note error:', error);
        res.status(500).json({ error: 'Failed to fetch note' });
    }
});

// Download note
router.get('/:id/download', authMiddleware, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        // Increment download count
        note.downloadCount += 1;
        await note.save();

        // Add to user's downloaded notes
        await User.findByIdAndUpdate(req.userId, {
            $addToSet: {
                downloadedNotes: {
                    noteId: note._id,
                    downloadedAt: new Date()
                }
            }
        });

        // Send file
        const filePath = path.join(__dirname, '..', note.fileUrl);
        res.download(filePath, note.fileName);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Download failed' });
    }
});

// Like/Unlike note
router.post('/:id/like', authMiddleware, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        const userIndex = note.likes.indexOf(req.userId);
        
        if (userIndex > -1) {
            // Unlike
            note.likes.splice(userIndex, 1);
        } else {
            // Like
            note.likes.push(req.userId);
        }

        await note.save();

        res.json({
            liked: userIndex === -1,
            likesCount: note.likes.length
        });
    } catch (error) {
        console.error('Like error:', error);
        res.status(500).json({ error: 'Failed to update like' });
    }
});

// Search notes
router.get('/search', optionalAuth, async (req, res) => {
    try {
        const { q, page = 1, limit = 12 } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const notes = await Note.find({
            $text: { $search: q },
            isApproved: true
        })
        .populate('uploadedBy', 'firstName lastName username')
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

        const count = await Note.countDocuments({
            $text: { $search: q },
            isApproved: true
        });

        res.json({
            notes,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalNotes: count,
            searchTime: new Date().getTime()
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Get related notes
router.get('/:id/related', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        // Find related notes by subject and class
        const relatedNotes = await Note.find({
            _id: { $ne: note._id },
            isApproved: true,
            $or: [
                { subject: note.subject },
                { class: note.class },
                { tags: { $in: note.tags } }
            ]
        })
        .populate('uploadedBy', 'firstName lastName username')
        .limit(3)
        .lean();

        res.json(relatedNotes);
    } catch (error) {
        console.error('Related notes error:', error);
        res.status(500).json({ error: 'Failed to fetch related notes' });
    }
});

// Delete note (only by uploader)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        // Check if user is the uploader
        if (note.uploadedBy.toString() !== req.userId.toString()) {
            return res.status(403).json({ error: 'Unauthorized to delete this note' });
        }

        // Delete file
        const filePath = path.join(__dirname, '..', note.fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Remove from user's uploadedNotes
        await User.findByIdAndUpdate(req.userId, {
            $pull: { uploadedNotes: note._id }
        });

        // Delete note
        await note.deleteOne();

        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

module.exports = router;