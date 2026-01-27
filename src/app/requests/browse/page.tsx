'use client';

import { useState, useMemo } from 'react';
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
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

export default function BrowseRequestsPage() {
  const t = ar.header.links;
  const t_browse = ar.browse_requests;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  
  const t_notifications = ar.notifications;

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

  const availableFields = useMemo(() => {
    if (!requests) return [];
    const fields = new Set(requests.map(r => r.field));
    return Array.from(fields);
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    return requests.filter(request => {
      const searchMatch = searchTerm === '' || request.title.toLowerCase().includes(searchTerm.toLowerCase());
      const fieldMatch = selectedField === 'all' || request.field === selectedField;
      const priceMatch = request.price >= priceRange[0] && request.price <= priceRange[1];
      return searchMatch && fieldMatch && priceMatch;
    });
  }, [requests, searchTerm, selectedField, priceRange]);


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

      const notificationsCol = collection(firestore, 'notifications');
      addDocumentNonBlocking(notificationsCol, {
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

      <div className="mb-8 p-4 border rounded-lg bg-secondary/50 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-1">
          <label className="text-sm font-medium mb-2 block">{t_browse.search_placeholder}</label>
          <Input 
            placeholder={t_browse.search_placeholder}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="md:col-span-1">
          <label className="text-sm font-medium mb-2 block">{t_browse.filter_by_field}</label>
          <Select value={selectedField} onValueChange={setSelectedField}>
            <SelectTrigger>
              <SelectValue placeholder={t_browse.filter_by_field} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t_browse.all_fields}</SelectItem>
              {availableFields.map(field => (
                <SelectItem key={field} value={field}>{field}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-1">
          <label className="text-sm font-medium mb-2 block">{t_browse.price_range}: <span className="font-bold text-primary">{priceRange[0]} - {priceRange[1]} جنيه</span></label>
          <Slider
            min={0}
            max={1000}
            step={50}
            value={[priceRange[1]]}
            onValueChange={value => setPriceRange([priceRange[0], value[0]])}
          />
        </div>
      </div>

      {filteredRequests && filteredRequests.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => (
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
          <p className="text-muted-foreground">لا توجد طلبات شرح متاحة تطابق معايير البحث. حاول مرة أخرى لاحقًا.</p>
        </div>
      )}
    </div>
  );
}
