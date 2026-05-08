const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A team must have a title'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'A team must have a description']
  },
  leaderId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A team must have a leader']
  },
  totalSize: {
    type: Number,
    required: [true, 'Please specify the total size of the team'],
    min: 2,
    max: 10
  },
  currentSize: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['INCOMPLETE', 'COMPLETE'],
    default: 'INCOMPLETE'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  requiredTracks: [{
    track: {
      type: String,
      enum: ['Frontend', 'Backend', 'AI', 'Mobile', 'UI/UX', 'Cybersecurity', 'Cloud'],
      required: true
    },
    neededCount: {
      type: Number,
      default: 1
    }
  }],
  members: [{
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update status based on size before saving
teamSchema.pre('save', function() {
  if (this.currentSize >= this.totalSize) {
    this.status = 'COMPLETE';
  } else {
    this.status = 'INCOMPLETE';
  }

});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
