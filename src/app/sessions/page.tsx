'use client';

import { useMemo, useState } from 'react';
import ar from '@/locales/ar';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import type { SessionRequest, UserProfile } from '@/lib/types';
import { collection, query, where, doc, updateDoc, getDocs, runTransaction, increment } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Video, CalendarX, CheckCircle, Clock, X, Loader2, Star } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { UserInfoLink } from '@/components/UserInfoLink';


// Helper component to display the other user's name and rating
function OtherUserDetails({ userId, label }: { userId: string, label: string }) {
  const firestore = useFirestore();
  const userProfileRef = useMemoFirebase(
    () => (userId ? doc(firestore, 'userProfiles', userId) : null),
    [firestore, userId]
  );
  const { data: userProfile, isLoading } = useDoc<UserProfile>(userProfileRef);

  if (isLoading) return <Skeleton className="h-5 w-32 mt-1" />;
  if (!userProfile) return null;

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
            <span>{label}:</span>
            <UserInfoLink userId={userId} className="text-sm font-semibold" />
        </div>
        {userProfile.rating && (
            <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-semibold">{userProfile.rating.toFixed(1)}</span>
            </div>
        )}
    </div>
  );
}

// Rating Dialog Component
function RatingDialog({ session, userRole, open, onOpenChange, onSubmitted }: { session: SessionRequest; userRole: 'student' | 'tutor'; open: boolean; onOpenChange: (open: boolean) => void; onSubmitted: () => void; }) {
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast({ variant: 'destructive', title: 'الرجاء اختيار تقييم' });
      return;
    }
    setIsSubmitting(true);
    
    const ratedField = userRole === 'student' ? 'tutorRating' : 'studentRating';
    const ratedUserId = userRole === 'student' ? session.tutorId : session.studentId;

    try {
      const sessionRef = doc(firestore, 'sessionRequests', session.id);
      await updateDoc(sessionRef, { [ratedField]: rating });

      // After submitting rating, update the average rating for the other user.
      if (ratedUserId) {
        await updateUserAverageRating(firestore, ratedUserId);
      }
      
      toast({ title: 'شكراً لتقييمك!', description: 'تم حفظ تقييمك بنجاح.' });
      onSubmitted();
    } catch (error: any) {
      console.error("Failed to submit rating:", error);
      toast({ variant: 'destructive', title: 'خطأ', description: error.message || 'لم نتمكن من حفظ التقييم.' });
    } finally {
      setIsSubmitting(false);
      onOpenChange(false);
      setRating(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تقييم الجلسة</DialogTitle>
          <DialogDescription>
            تقييمك يساعدنا على تحسين جودة المنصة. الرجاء تقييم تجربتك.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center items-center gap-2 py-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-8 h-8 cursor-pointer transition-colors ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="ghost">إلغاء</Button>
          <Button onClick={handleRatingSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            إرسال التقييم
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// Function to update a user's average rating
async function updateUserAverageRating(firestore: any, userId: string) {
  // Find all completed sessions where the user was either a student or a tutor
  const studentSessionsQuery = query(collection(firestore, 'sessionRequests'), where('studentId', '==', userId), where('status', '==', 'completed'));
  const tutorSessionsQuery = query(collection(firestore, 'sessionRequests'), where('tutorId', '==', userId), where('status', '==', 'completed'));

  const [studentSessionsSnapshot, tutorSessionsSnapshot] = await Promise.all([
    getDocs(studentSessionsQuery),
    getDocs(tutorSessionsQuery)
  ]);
  
  const allRatings: number[] = [];

  studentSessionsSnapshot.forEach(doc => {
    const data = doc.data() as SessionRequest;
    if (data.studentRating) {
      allRatings.push(data.studentRating);
    }
  });

  tutorSessionsSnapshot.forEach(doc => {
    const data = doc.data() as SessionRequest;
    if (data.tutorRating) {
      allRatings.push(data.tutorRating);
    }
  });

  if (allRatings.length > 0) {
    const averageRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
    const userProfileRef = doc(firestore, 'userProfiles', userId);
    await updateDoc(userProfileRef, { rating: averageRating });
  }
}



export default function MySessionsPage() {
  const t = ar.header.links;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [ratingSession, setRatingSession] = useState<SessionRequest | null>(null);

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'userProfiles', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !userProfile?.role) return null;

    if (userProfile.role === 'student') {
      return query(collection(firestore, 'sessionRequests'), where('studentId', '==', user.uid));
    }
    if (userProfile.role === 'tutor') {
      return query(collection(firestore, 'sessionRequests'), where('tutorId', '==', user.uid));
    }
    return null;
  }, [firestore, user, userProfile]);

  const { data: sessions, isLoading: isLoadingSessions } = useCollection<SessionRequest>(sessionsQuery);
  
  const handleCompleteSession = async (session: SessionRequest) => {
    if (!session.tutorId) return;
    setUpdatingId(session.id);

    try {
      await runTransaction(firestore, async (transaction) => {
        const studentRef = doc(firestore, 'userProfiles', session.studentId);
        const tutorRef = doc(firestore, 'userProfiles', session.tutorId!);
        const sessionRef = doc(firestore, 'sessionRequests', session.id);

        const studentSnap = await transaction.get(studentRef);

        if (!studentSnap.exists() || (studentSnap.data().balance ?? 0) < session.price) {
          throw new Error('رصيد الطالب غير كافٍ لإتمام هذه الجلسة.');
        }

        const payoutAmount = session.price * 0.8;

        // 1. Update balances
        transaction.update(studentRef, { balance: increment(-session.price) });
        transaction.update(tutorRef, { balance: increment(payoutAmount) });

        // 2. Update session status
        transaction.update(sessionRef, { status: 'completed' });

        // 3. Create transaction logs
        const transactionsCol = collection(firestore, 'transactions');
        const studentTxRef = doc(transactionsCol);
        const tutorTxRef = doc(transactionsCol);

        transaction.set(studentTxRef, {
          userId: session.studentId,
          type: 'session_payment',
          amount: -session.price,
          description: `دفع مقابل جلسة: ${session.title}`,
          sessionId: session.id,
          createdAt: new Date().toISOString()
        });

        transaction.set(tutorTxRef, {
          userId: session.tutorId!,
          type: 'session_payout',
          amount: payoutAmount,
          description: `أرباح جلسة: ${session.title}`,
          sessionId: session.id,
          createdAt: new Date().toISOString()
        });
      });

      toast({ title: 'تم إنهاء الجلسة بنجاح', description: 'تم تحويل الأموال وتقييد المعاملات.' });

    } catch (e: any) {
      console.error("Failed to complete session:", e);
      toast({ variant: 'destructive', title: 'فشل إنهاء الجلسة', description: e.message });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelSession = async (session: SessionRequest) => {
      setUpdatingId(session.id);
      const sessionRef = doc(firestore, 'sessionRequests', session.id);
      updateDocumentNonBlocking(sessionRef, { status: 'cancelled' });
      toast({ title: 'تم إلغاء الجلسة' });
      setUpdatingId(null);
  };

  const upcomingSessions = useMemo(() => sessions?.filter(s => s.status === 'accepted').sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()) || [], [sessions]);
  const completedSessions = useMemo(() => sessions?.filter(s => s.status === 'completed').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [], [sessions]);
  const otherSessions = useMemo(() => sessions?.filter(s => s.status === 'open' || s.status === 'cancelled').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [], [sessions]);

  const isLoading = isUserLoading || isProfileLoading || isLoadingSessions;

  const renderSessionList = (sessionList: SessionRequest[], emptyMessage: string) => {
    if (sessionList.length === 0) {
      return (
        <div className="border rounded-lg p-8 text-center bg-secondary/50 mt-4">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }
    
    const statusTranslations: Record<SessionRequest['status'], string> = {
        open: 'مفتوح',
        accepted: 'مقبولة',
        completed: 'مكتملة',
        cancelled: 'ملغاة',
    };

    const getStatusVariant = (status: SessionRequest['status']): "default" | "secondary" | "destructive" | "outline" => {
      switch (status) {
        case 'accepted': return 'default';
        case 'completed': return 'outline';
        case 'cancelled': return 'destructive';
        default: return 'secondary';
      }
    };

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
        {sessionList.map((session) => {
            const hasStudentRated = session.tutorRating !== undefined && session.tutorRating !== null;
            const hasTutorRated = session.studentRating !== undefined && session.studentRating !== null;

          return (
          <Card key={session.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <CardTitle className="text-xl leading-snug">{session.title}</CardTitle>
                  <Badge variant={getStatusVariant(session.status)} className="shrink-0">{statusTranslations[session.status]}</Badge>
              </div>
              <CardDescription>{session.field}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <div className="text-sm text-muted-foreground">
                <p>{new Date(session.sessionDate).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p>الساعة: {session.sessionTime}</p>
              </div>
              {userProfile?.role === 'student' && session.tutorId ? <OtherUserDetails userId={session.tutorId} label="المفهّم" /> : null}
              {userProfile?.role === 'tutor' && <OtherUserDetails userId={session.studentId} label="المستفهم" />}
               <p className="font-bold text-primary text-lg">{session.price} جنيه</p>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-2">
                {session.status === 'accepted' && (
                    <>
                        <Button asChild>
                            <Link href={`/session/${session.id}`}>
                                <Video className="me-2 h-4 w-4" />
                                دخول الجلسة
                            </Link>
                        </Button>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline"
                                className="w-full"
                                onClick={() => handleCompleteSession(session)}
                                disabled={updatingId === session.id}
                            >
                                {updatingId === session.id ? <Loader2 className="me-2 h-4 w-4 animate-spin"/> : <CheckCircle className="me-2 h-4 w-4" />}
                                إنهاء الجلسة
                            </Button>
                            <Button 
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelSession(session)}
                                disabled={updatingId === session.id}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">إلغاء</span>
                            </Button>
                        </div>
                    </>
                )}
                {session.status === 'open' && userProfile?.role === 'student' && (
                     <Button 
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleCancelSession(session)}
                        disabled={updatingId === session.id}
                    >
                        {updatingId === session.id ? <Loader2 className="me-2 h-4 w-4 animate-spin"/> : <X className="me-2 h-4 w-4" />}
                        إلغاء الطلب
                    </Button>
                )}
                {session.status === 'completed' && userProfile?.role === 'student' && !hasStudentRated && (
                     <Button variant="secondary" onClick={() => setRatingSession(session)}>
                        <Star className="me-2 h-4 w-4" />
                        قيّم المفهّم
                    </Button>
                )}
                 {session.status === 'completed' && userProfile?.role === 'tutor' && !hasTutorRated && (
                     <Button variant="secondary" onClick={() => setRatingSession(session)}>
                        <Star className="me-2 h-4 w-4" />
                        قيّم المستفهم
                    </Button>
                )}
            </CardFooter>
          </Card>
        )})}
      </div>
    );
  };
  
  if (isLoading) {
     return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold font-headline mb-6">{t.my_sessions}</h1>
             <div className="space-y-4">
                <Skeleton className="h-10 w-full max-w-sm" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                    <Skeleton className="h-72 w-full" />
                    <Skeleton className="h-72 w-full" />
                    <Skeleton className="h-72 w-full" />
                </div>
             </div>
        </div>
    )
  }
  
  if (!user) {
    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold font-headline mb-6">{t.my_sessions}</h1>
            <div className="border rounded-lg p-8 text-center bg-secondary/50">
                <p className="text-muted-foreground">الرجاء تسجيل الدخول لعرض جلساتك.</p>
                <Button asChild className="mt-4"><Link href="/login">تسجيل الدخول</Link></Button>
            </div>
        </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold font-headline mb-6">{t.my_sessions}</h1>
      
      {ratingSession && userProfile?.role && (
        <RatingDialog 
          session={ratingSession}
          userRole={userProfile.role}
          open={!!ratingSession}
          onOpenChange={(open) => !open && setRatingSession(null)}
          onSubmitted={() => {
            // Optional: could trigger a re-fetch or rely on the listener
          }}
        />
      )}

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">
            <Clock className="me-2 h-4 w-4" />
            القادمة ({upcomingSessions.length})
            </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle className="me-2 h-4 w-4" />
            المكتملة ({completedSessions.length})
          </TabsTrigger>
          <TabsTrigger value="others">
            <CalendarX className="me-2 h-4 w-4" />
            الأخرى ({otherSessions.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {renderSessionList(upcomingSessions, 'لا توجد جلسات قادمة.')}
        </TabsContent>
        <TabsContent value="completed">
          {renderSessionList(completedSessions, 'لا توجد جلسات مكتملة سابقة.')}
        </TabsContent>
        <TabsContent value="others">
          {renderSessionList(otherSessions, 'لا توجد طلبات مفتوحة أو ملغاة.')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
