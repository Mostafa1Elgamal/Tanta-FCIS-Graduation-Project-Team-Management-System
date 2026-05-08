export type UserRole = 'student' | 'admin';

export interface User {
  _id: string;
  name: string;
  phoneNumber: string;
  email?: string;
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

export interface TeamRequest {
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
  userId: string;
  type: 'TEAM_SWITCH_REQUEST' | 'TEAM_SWITCH_RESPONSE' | 'TEAM_UPDATED' | 'MEMBER_ADDED' | 'MEMBER_REMOVED';
  content: string;
  isRead: boolean;
  relatedId?: any;
  createdAt: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}
