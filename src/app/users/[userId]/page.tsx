'use client';

import { useParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { UserProfile, SessionRequest } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Briefcase, CalendarDays, ShieldCheck } from 'lucide-react';
import ar from '@/locales/ar';
import { useMemo } from 'react';
import { UserInfoLink } from '@/components/UserInfoLink';


function getInitials(name?: string | null) {
  if (typeof name !== 'string' || !name) {
    return '?';
  }
  return name.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
}


function UserReviews({ userId }: { userId: string }) {
    const firestore = useFirestore();

    const studentSessionsQuery = useMemoFirebase(
        () => query(collection(firestore, 'sessionRequests'), where('studentId', '==', userId), where('status', '==', 'completed')),
        [firestore, userId]
    );
    const { data: studentSessions, isLoading: isLoadingStudent } = useCollection<SessionRequest>(studentSessionsQuery);
    
    const tutorSessionsQuery = useMemoFirebase(
        () => query(collection(firestore, 'sessionRequests'), where('tutorId', '==', userId), where('status', '==', 'completed')),
        [firestore, userId]
    );
    const { data: tutorSessions, isLoading: isLoadingTutor } = useCollection<SessionRequest>(tutorSessionsQuery);

    const reviews = useMemo(() => {
        const allSessions = [...(studentSessions || []), ...(tutorSessions || [])];
        const receivedReviews = allSessions
            .map(session => {
                const isUserTheStudent = session.studentId === userId;
                
                // Review FOR the student BY the tutor
                if (isUserTheStudent && session.tutorReview && session.tutorId) {
                    return {
                        review: session.tutorReview,
                        rating: session.studentRating,
                        reviewerId: session.tutorId,
                        sessionTitle: session.title,
                        createdAt: session.createdAt
                    };
                }
                
                // Review FOR the tutor BY the student
                if (!isUserTheStudent && session.studentReview && session.studentId) {
                     return {
                        review: session.studentReview,
                        rating: session.tutorRating,
                        reviewerId: session.studentId,
                        sessionTitle: session.title,
                        createdAt: session.createdAt
                    };
                }
                return null;
            })
            .filter((review): review is NonNullable<typeof review> => review !== null && review.rating !== undefined && review.review !== undefined && review.review.trim() !== '')
            .sort((a, b) => new Date(b!.createdAt).getTime() - new Date(a!.createdAt).getTime());
        
        return receivedReviews;

    }, [studentSessions, tutorSessions, userId]);

    if (isLoadingStudent || isLoadingTutor) {
        return (
            <div className="mt-8 space-y-4">
                 <h3 className="text-xl font-headline font-semibold mb-4 text-center">التقييمات والمراجعات</h3>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }
    
    if (reviews.length === 0) {
        return (
            <div className="mt-8">
                <h3 className="text-xl font-headline font-semibold mb-4 text-center">التقييمات والمراجعات</h3>
                <p className="text-center text-muted-foreground">لا توجد مراجعات متاحة لهذا المستخدم بعد.</p>
          </div>
        );
    }

    return (
        <div className="mt-8">
            <h3 className="text-xl font-headline font-semibold mb-4 text-center">التقييمات والمراجعات</h3>
            <div className="space-y-6">
                {reviews.map((review, index) => (
                    <Card key={index} className="bg-secondary/50">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold">بخصوص جلسة: "{review.sessionTitle}"</p>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <span>بواسطة:</span><UserInfoLink userId={review.reviewerId} />
                                    </div>
                                </div>
                                {review.rating && (
                                    <div className="flex items-center gap-0.5 text-yellow-400 shrink-0">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${review.rating! > i ? 'fill-current' : ''}`} />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <p className="mt-4 text-foreground italic">"{review.review}"</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
    () => (userId ? doc(firestore, 'userProfiles', userId) : null),
    [firestore, userId]
  );
  const { data: userProfile, isLoading } = useDoc<UserProfile>(userProfileRef);

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex flex-col items-center gap-6">
          <Skeleton className="h-32 w-32 rounded-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-24" />
          <div className="mt-4 w-full max-w-2xl">
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container py-12 text-center">
        <p>لم يتم العثور على المستخدم.</p>
      </div>
    );
  }
  
  const roleTranslation = userProfile.role === 'student' ? 'مستفهم' : (userProfile.role === 'tutor' ? 'مفهّم' : 'غير محدد');

  return (
    <div className="container py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="items-center text-center">
          <Avatar className="h-32 w-32 mb-4 border-4 border-primary/20">
            <AvatarImage src={userProfile.photoURL || undefined} alt={userProfile.name || ''} />
            <AvatarFallback className="text-4xl">{getInitials(userProfile.name)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-headline">{userProfile.name}</CardTitle>
          <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                <span>{roleTranslation}</span>
              </div>
               {userProfile.isAdmin && (
                  <div className="flex items-center gap-1 text-primary">
                    <ShieldCheck className="h-4 w-4" />
                    <span>مسؤول</span>
                  </div>
              )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground">متوسط التقييم</p>
                {userProfile.rating ? (
                     <div className="flex items-center justify-center gap-1 text-yellow-500 mt-1">
                        <Star className="w-6 h-6 fill-current" />
                        <span className="font-bold text-2xl">{userProfile.rating.toFixed(1)}</span>
                    </div>
                ) : (
                    <p className="font-semibold text-lg mt-1">لا يوجد تقييم بعد</p>
                )}
              </div>
               <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground">تاريخ الانضمام</p>
                 <div className="flex items-center justify-center gap-2 mt-1">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    <p className="font-semibold text-lg">{new Date(userProfile.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}</p>
                </div>
              </div>
          </div>
          <UserReviews userId={userId} />
        </CardContent>
      </Card>
    </div>
  );
}
