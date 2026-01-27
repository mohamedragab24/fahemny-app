'use client';

import { useMemo, useState } from 'react';
import ar from '@/locales/ar';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import type { SessionRequest, UserProfile } from '@/lib/types';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Video, CalendarX, CheckCircle, Clock, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

// Helper component to display the other user's name
function OtherUserDetails({ userId, label }: { userId: string, label: string }) {
  const firestore = useFirestore();
  const userProfileRef = useMemoFirebase(
    () => (userId ? doc(firestore, 'userProfiles', userId) : null),
    [firestore, userId]
  );
  const { data: userProfile, isLoading } = useDoc<UserProfile>(userProfileRef);

  if (isLoading) return <Skeleton className="h-5 w-32 mt-1" />;
  if (!userProfile) return null;

  return <p className="text-sm text-muted-foreground">{label}: {userProfile.name}</p>;
}


export default function MySessionsPage() {
  const t = ar.header.links;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const handleUpdateStatus = (sessionId: string, newStatus: 'completed' | 'cancelled') => {
    setUpdatingId(sessionId);
    const sessionRef = doc(firestore, 'sessionRequests', sessionId);
    updateDocumentNonBlocking(sessionRef, { status: newStatus });
    toast({
        title: `تم تحديث حالة الجلسة`,
        description: `تم ${newStatus === 'completed' ? 'إنهاء' : 'إلغاء'} الجلسة بنجاح.`
    });
    // The UI will update automatically due to the real-time listener.
    // We can set updatingId to null after a short delay to allow UI to catch up.
    setTimeout(() => setUpdatingId(null), 1000);
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
        {sessionList.map((session) => (
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
                        {session.meetingLink && (
                             <Button asChild>
                                <Link href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                                    <Video className="me-2 h-4 w-4" />
                                    دخول الجلسة
                                </Link>
                            </Button>
                        )}
                        <div className="flex gap-2">
                            <Button 
                                variant="outline"
                                className="w-full"
                                onClick={() => handleUpdateStatus(session.id, 'completed')}
                                disabled={updatingId === session.id}
                            >
                                {updatingId === session.id ? <Loader2 className="me-2 h-4 w-4 animate-spin"/> : <CheckCircle className="me-2 h-4 w-4" />}
                                إنهاء الجلسة
                            </Button>
                            <Button 
                                variant="destructive"
                                size="sm"
                                onClick={() => handleUpdateStatus(session.id, 'cancelled')}
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
                        onClick={() => handleUpdateStatus(session.id, 'cancelled')}
                        disabled={updatingId === session.id}
                    >
                        {updatingId === session.id ? <Loader2 className="me-2 h-4 w-4 animate-spin"/> : <X className="me-2 h-4 w-4" />}
                        إلغاء الطلب
                    </Button>
                )}
            </CardFooter>
          </Card>
        ))}
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
