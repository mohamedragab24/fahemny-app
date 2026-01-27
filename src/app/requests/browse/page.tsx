'use client';

import { useState } from 'react';
import ar from '@/locales/ar';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import type { SessionRequest, UserProfile } from '@/lib/types';
import { collection, query, where, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function BrowseRequestsPage() {
  const t = ar.header.links;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'userProfiles', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);

  const requestsQuery = useMemoFirebase(
    () => {
      if (firestore && userProfile?.role === 'tutor') {
        return query(collection(firestore, 'sessionRequests'), where('status', '==', 'open'));
      }
      return null;
    },
    [firestore, userProfile]
  );

  const { data: requests, isLoading: isLoadingRequests } = useCollection<SessionRequest>(requestsQuery);


  const handleAccept = async (request: SessionRequest) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'يجب أن تكون مسجلاً للدخول لقبول الطلبات.' });
      return;
    }

    setAcceptingId(request.id);

    try {
      const requestRef = doc(firestore, 'sessionRequests', request.id);
      
      // We only need to update the status and assign the tutor.
      // The meeting link is now dynamically handled on the session page.
      updateDocumentNonBlocking(requestRef, {
        status: 'accepted',
        tutorId: user.uid,
      });

      toast({
        variant: 'default',
        title: 'تم قبول الطلب!',
        description: 'تم تحديث الطلب وسيتم توجيهك لصفحة جلساتك.',
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
  
  const isLoading = isLoadingRequests || isUserLoading || isLoadingProfile;
  
  if (isLoading) {
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

      {requests && requests.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <Card key={request.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{request.title}</CardTitle>
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
          ))}
        </div>
      ) : (
        <div className="border rounded-lg p-8 text-center bg-secondary/50 mt-8">
          <p className="text-muted-foreground">لا توجد طلبات شرح متاحة حاليًا. حاول مرة أخرى لاحقًا.</p>
        </div>
      )}
    </div>
  );
}
