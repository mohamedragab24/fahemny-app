'use client';

import { useState, useMemo, useEffect } from 'react';
import ar from '@/locales/ar';
import { useFirestore, useDoc } from '@/firebase';
import type { SessionRequest, UserProfile } from '@/lib/types';
import { collection, query, where, doc, getDocs, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Input } from '@/components/ui/input';
import { UserInfoLink } from '@/components/UserInfoLink';
import { useUser, useMemoFirebase } from '@/firebase';

export default function BrowseRequestsPage() {
  const t = ar.header.links;
  const t_browse = ar.browse_requests;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const t_notifications = ar.notifications;

  const userProfileRef = useMemoFirebase(() => (user ? doc(firestore, 'userProfiles', user.uid) : null), [firestore, user]);
  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);

  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const REQUESTS_PER_PAGE = 15;

  const fetchRequests = async (loadMore = false) => {
    if (loadMore && !hasMore) return;
    try {
      if (loadMore) setIsLoadingMore(true);
      else setIsLoading(true);

      let q = query(
        collection(firestore, 'sessionRequests'),
        where('status', '==', 'open'),
        orderBy('createdAt', 'desc'),
        limit(REQUESTS_PER_PAGE)
      );

      if (loadMore && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const documentSnapshots = await getDocs(q);
      const newRequests = documentSnapshots.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as SessionRequest))
        .filter(request => {
             const isExpired = request.expiresAt && new Date(request.expiresAt) < new Date();
             return !isExpired;
        });

      setRequests(prev => loadMore ? [...prev, ...newRequests] : newRequests);
      
      const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(lastDoc);

      if (documentSnapshots.docs.length < REQUESTS_PER_PAGE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (e: any) {
      console.error("Failed to fetch requests", e);
      toast({ variant: 'destructive', title: 'فشل تحميل الطلبات', description: e.message });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };
  
  useEffect(() => {
    fetchRequests(false);
  }, []);

  const { matchingRequests, otherRequests } = useMemo(() => {
    if (!requests || !userProfile) return { matchingRequests: [], otherRequests: [] };
    
    const searched = requests.filter(request => {
      return searchTerm === '' || request.title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const tutorSpecialties = new Set(userProfile.specialties || []);
    if (tutorSpecialties.size === 0) {
        return { matchingRequests: [], otherRequests: searched };
    }

    const matching: SessionRequest[] = [];
    const others: SessionRequest[] = [];

    searched.forEach(request => {
        if (tutorSpecialties.has(request.field)) {
            matching.push(request);
        } else {
            others.push(request);
        }
    });
    return { matchingRequests: matching, otherRequests: others };

  }, [requests, searchTerm, userProfile]);

  const handleAccept = async (request: SessionRequest) => {
    if (!user || !userProfile) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'يجب أن تكون مسجلاً للدخول لقبول الطلبات.' });
      return;
    }

    setAcceptingId(request.id);

    try {
      const requestRef = doc(firestore, 'sessionRequests', request.id);
      const meetingLink = `https://meet.jit.si/Fahemny-Session-${request.id}`;
      
      updateDocumentNonBlocking(requestRef, {
        status: 'accepted',
        tutorId: user.uid,
        meetingLink: meetingLink,
      });

      addDocumentNonBlocking(collection(firestore, 'notifications'), {
        userId: request.studentId,
        title: t_notifications.request_accepted_title,
        message: t_notifications.request_accepted_message
          .replace('{tutorName}', userProfile.name)
          .replace('{sessionTitle}', request.title),
        link: '/sessions',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      toast({
        variant: 'default',
        title: 'تم قبول الطلب!',
        description: 'تم إنشاء رابط الجلسة الفريد وإشعار الطالب.',
      });

      router.push('/sessions');

    } catch (error: any) {
      console.error("Failed to accept request:", error);
      toast({
        variant: 'destructive',
        title: 'فشل قبول الطلب',
        description: error.message || 'حدث خطأ أثناء تحديث الطلب.',
      });
    } finally {
      setAcceptingId(null);
    }
  };
  
  const isPageLoading = isUserLoading || isLoadingProfile;

  const renderRequestCard = (request: SessionRequest) => (
    <Card key={request.id} className="flex flex-col">
        <CardHeader>
        <CardTitle>{request.title}</CardTitle>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
            <span>بواسطة:</span><UserInfoLink userId={request.studentId} className="text-sm" />
        </div>
        <CardDescription>{request.field}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
        <p className="line-clamp-3 text-sm text-muted-foreground">{request.description}</p>
        <div className="flex justify-between items-center mt-4 text-sm ">
            <span className="text-muted-foreground">السعر: <span className="font-bold text-primary">{request.price} جنيه</span></span>
            <span className="text-muted-foreground">{new Date(request.sessionDate).toLocaleDateString('ar-EG')} - {request.sessionTime}</span>
        </div>
        </CardContent>
        <CardFooter>
        <Button 
            className="w-full" 
            onClick={() => handleAccept(request)}
            disabled={acceptingId !== null}
        >
            {acceptingId === request.id ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جار القبول...
            </>
            ) : "قبول الطلب"}
        </Button>
        </CardFooter>
    </Card>
  );
  
  if (isPageLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold font-headline mb-6">{t.browse_requests}</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
                <CardHeader><Skeleton className="h-6 bg-muted rounded w-3/4" /></CardHeader>
                <CardContent>
                    <Skeleton className="h-4 bg-muted rounded w-full" />
                    <Skeleton className="h-4 bg-muted rounded w-1/2 mt-2" />
                </CardContent>
                <CardFooter><Skeleton className="h-10 bg-muted rounded w-full" /></CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (userProfile?.role !== 'tutor') {
    return (
         <div className="container py-8">
            <h1 className="text-3xl font-bold font-headline mb-6">{t.browse_requests}</h1>
            <div className="border rounded-lg p-8 text-center bg-secondary/50">
                <p className="text-muted-foreground">هذه الصفحة مخصصة للمفهّمين فقط. يمكنك تغيير دورك من ملفك الشخصي.</p>
            </div>
        </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold font-headline mb-6">{t.browse_requests}</h1>

      <div className="mb-8 p-4 border rounded-lg bg-secondary/50">
          <label className="text-sm font-medium mb-2 block">{t_browse.search_placeholder}</label>
          <Input 
            placeholder={t_browse.search_placeholder}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
      </div>
      
       {isLoading && <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-72 w-full" /><Skeleton className="h-72 w-full" /><Skeleton className="h-72 w-full" /></div>}

       {!isLoading && requests.length === 0 ? (
        <div className="border rounded-lg p-8 text-center bg-secondary/50 mt-8">
            <p className="text-muted-foreground">لا توجد طلبات شرح متاحة حاليًا. حاول مرة أخرى لاحقًا.</p>
        </div>
      ) : (
        <>
            {matchingRequests.length > 0 && (
            <section className="mb-12">
                <h2 className="text-2xl font-bold font-headline mb-4">طلبات تناسب تخصصك</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {matchingRequests.map(renderRequestCard)}
                </div>
            </section>
            )}

            {otherRequests.length > 0 && (
            <section>
                <h2 className="text-2xl font-bold font-headline mb-4">
                {matchingRequests.length > 0 ? 'طلبات أخرى' : 'كل الطلبات المتاحة'}
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {otherRequests.map(renderRequestCard)}
                </div>
            </section>
            )}
             {hasMore && !isLoadingMore && (
                <div className="mt-8 text-center">
                    <Button onClick={() => fetchRequests(true)}>
                        تحميل المزيد
                    </Button>
                </div>
            )}
            {isLoadingMore && (
                <div className="mt-8 text-center">
                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
        </>
      )}
    </div>
  );
}
