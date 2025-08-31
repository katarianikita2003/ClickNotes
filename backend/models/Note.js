const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    class: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    thumbnailUrl: {
        type: String,
        default: '/img/default-note.jpg'
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    views: {
        type: Number,
        default: 0
    },
    readingTime: {
        type: String,
        default: '5 min'
    },
    tags: [{
        type: String,
        trim: true
    }],
    isApproved: {
        type: Boolean,
        default: true // Set to false if you want admin approval
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamps
noteSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for formatted date
noteSchema.virtual('formattedDate').get(function() {
    const options = { day: '2-digit', month: 'long' };
    return this.createdAt.toLocaleDateString('en-US', options);
});

// Index for search
noteSchema.index({ title: 'text', description: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Note', noteSchema);