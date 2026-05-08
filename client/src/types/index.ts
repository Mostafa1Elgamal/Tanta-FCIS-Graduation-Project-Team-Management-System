export type UserRole = 'student' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  tracks: string[];
  skills: string[];
  bio?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  status: 'LOOKING' | 'IN_TEAM';
  isLookingForTeam: boolean; // Virtual or helper field
  team?: string | Team;
  createdAt: string;
}

export interface Team {
  _id: string;
  title: string;
  description: string;
  leaderId: string | User;
  totalSize: number;
  currentSize: number;
  status: 'INCOMPLETE' | 'COMPLETE';
  isPrivate: boolean;
  requiredTracks: {
    track: string;
    neededCount: number;
  }[];
  members: {
    userId: string | User;
    role: string;
    joinedAt: string;
  }[];
  createdAt: string;
}

export interface Request {
  _id: string;
  senderId: string | User;
  receiverId?: string | User;
  teamId: string | Team;
  type: 'APPLICATION' | 'INVITATION';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  track?: string;
  message?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: string | User;
  type: 'application' | 'invitation' | 'acceptance' | 'rejection' | 'team_update';
  content: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}
