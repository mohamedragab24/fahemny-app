export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role?: 'student' | 'tutor';
  photoURL?: string;
  rating?: number;
  balance?: number;
  isVerified?: boolean;
  isAdmin?: boolean;
  disabled?: boolean;
  createdAt: string;
  specialties?: string[];
};

export type SessionRequest = {
  id: string;
  studentId: string;
  tutorId?: string;
  title: string;
  field: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountCode?: string;
  sessionDate: string;
  sessionTime: string;
  tutorGender: 'male' | 'female' | 'any';
  status: 'open' | 'accepted' | 'completed' | 'cancelled';
  createdAt: string;
  meetingLink?: string;
  studentRating?: number;
  tutorRating?: number;
  studentReview?: string;
  tutorReview?: string;
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

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
};

export type WithdrawalRequest = {
    id: string;
    userId: string;
    userName: string; // Denormalized for admin display
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    details: string; // For withdrawal details like Instapay/Vodafone Cash
    adminNotes?: string; // For admin when rejecting
};

export type DiscountCode = {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    usageLimit: number;
    usageCount: number;
    isActive: boolean;
    createdAt: string;
};
