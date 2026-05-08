const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/userModel');
const Team = require('./src/models/teamModel');
const Request = require('./src/models/requestModel');
const Notification = require('./src/models/notificationModel');

dotenv.config();

const users = [
  {
    name: 'Ahmed Ali',
    email: 'ahmed@example.com',
    password: 'password123',
    department: 'CS',
    tracks: ['Backend', 'Cloud'],
    skills: ['Node.js', 'Express', 'MongoDB', 'Docker'],
    status: 'IN_TEAM',
    bio: 'Backend developer passionate about scalable systems.'
  },
  {
    name: 'Sara Mohamed',
    email: 'sara@example.com',
    password: 'password123',
    department: 'IS',
    tracks: ['Frontend', 'UI/UX'],
    skills: ['React', 'Tailwind', 'Figma'],
    status: 'LOOKING',
    bio: 'Frontend enthusiast and UI designer.'
  },
  {
    name: 'Omar Hassan',
    email: 'omar@example.com',
    password: 'password123',
    department: 'CS',
    tracks: ['AI', 'Backend'],
    skills: ['Python', 'PyTorch', 'FastAPI'],
    status: 'LOOKING',
    bio: 'Interested in AI and ML applications.'
  },
  {
    name: 'Mona Zein',
    email: 'mona@example.com',
    password: 'password123',
    department: 'IT',
    tracks: ['Mobile'],
    skills: ['Flutter', 'Dart', 'Firebase'],
    status: 'LOOKING',
    bio: 'Mobile app developer with Flutter experience.'
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Team.deleteMany({});
    await Request.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing data.');

    // Create users
    const createdUsers = await User.create(users);
    console.log('Created users.');

    // Create a team
    const leader = createdUsers[0];
    const team = await Team.create({
      title: 'Smart Agriculture AI',
      description: 'An AI-powered system for monitoring crop health using satellite imagery. We need AI and Frontend experts.',
      leaderId: leader._id,
      totalSize: 4,
      currentSize: 1,
      requiredTracks: [
        { track: 'AI', neededCount: 1 },
        { track: 'Frontend', neededCount: 1 },
        { track: 'UI/UX', neededCount: 1 }
      ],
      members: [{
        userId: leader._id,
        role: 'Backend & Cloud Leader',
        joinedAt: Date.now()
      }]
    });
    console.log('Created sample team.');

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
