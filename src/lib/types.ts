export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role?: 'student' | 'tutor';
  photoURL?: string;
  rating?: number;
  isVerified?: boolean;
  isAdmin?: boolean;
  createdAt: string;
};

export type SessionRequest = {
  id: string;
  studentId: string;
  tutorId?: string;
  title: string;
  field: string;
  description: string;
  price: number;
  sessionDate: string;
  sessionTime: string;
  tutorGender: 'male' | 'female' | 'any';
  status: 'open' | 'accepted' | 'completed' | 'cancelled';
  meetingLink?: string;
  createdAt: string;
  studentRating?: number;
  tutorRating?: number;
};

export type Transaction = {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'session_payment' | 'session_payout';
  amount: number;
  description: string;
  sessionId?: string;
  createdAt: string;
};
