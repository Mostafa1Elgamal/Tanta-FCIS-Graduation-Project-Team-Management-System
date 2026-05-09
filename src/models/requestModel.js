const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A request must have a sender']
  },
  receiverId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  teamId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Team',
    required: [true, 'A request must be associated with a team']
  },
  type: {
    type: String,
    enum: ['APPLICATION', 'INVITATION'],
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING'
  },
  track: {
    type: String,
    enum: ['Frontend', 'Backend', 'AI', 'Mobile', 'UI/UX', 'Cybersecurity', 'Cloud', 'Data Science', 'Machine Learning', 'Embedded Systems', 'Game Development', 'DevOps', 'Blockchain', 'Software Testing']
  },
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate requests between same user and team for same type
requestSchema.index({ senderId: 1, teamId: 1, type: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'PENDING' } });

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;
