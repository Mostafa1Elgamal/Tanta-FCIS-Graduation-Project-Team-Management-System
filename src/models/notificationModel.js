const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Notification must belong to a user']
  },
  content: {
    type: String,
    required: [true, 'Notification must have content']
  },
  type: {
    type: String,
    enum: ['TEAM_SWITCH_REQUEST', 'TEAM_SWITCH_RESPONSE', 'TEAM_UPDATED', 'MEMBER_ADDED', 'MEMBER_REMOVED'],
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedId: {
    type: mongoose.Schema.ObjectId // Can be TeamId or RequestId
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
