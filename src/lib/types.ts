export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'employer' | 'freelancer';
  photoURL?: string;
  isVerified?: boolean;
  isAdmin?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  employerId: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  tags?: string[];
  proposals?: number;
  createdAt: string;
  updatedAt: string;
};

export type Offer = {
  id: string;
  projectId: string;
  freelancerId: string;
  description: string;
  rate: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string; // ISO string
};
