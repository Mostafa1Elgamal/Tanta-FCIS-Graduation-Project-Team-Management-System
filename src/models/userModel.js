const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide your phone number'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\+[1-9]\d{9,14}$/.test(v);
      },
      message: props => `${props.value} is not a valid E.164 phone number!`
    }
  },
  email: {
    type: String,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  department: {
    type: String,
    required: [true, 'Please specify your department']
  },
  status: {
    type: String,
    enum: ['LOOKING', 'IN_TEAM'],
    default: 'LOOKING'
  },
  tracks: [{
    type: String,
    enum: ['Frontend', 'Backend', 'AI', 'Mobile', 'UI/UX', 'Cybersecurity', 'Cloud', 'Data Analysis']
  }],
  skills: [String],
  bio: {
    type: String,
    maxlength: 500
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  team: {
    type: mongoose.Schema.ObjectId,
    ref: 'Team'
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  bannedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
