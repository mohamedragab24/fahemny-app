
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { User as UserIcon, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ar from '@/locales/ar';
import { useEffect } from 'react';

export default function SelectRolePage() {
  const t = ar.select_role;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'userProfiles', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  useEffect(() => {
    // Wait until we have all the user info.
    if (isUserLoading || isProfileLoading) {
      return;
    }

    // If there's no user, send to login.
    if (!user) {
      router.replace('/login');
      return;
    }
    
    // If the user already has a role, redirect them to their dashboard.
    if (userProfile?.role) {
      toast({ title: 'أهلاً بعودتك!', description: 'يتم توجيهك إلى لوحة التحكم الخاصة بك.' });
      if (userProfile.role === 'student') {
        router.replace('/requests/create');
      } else if (userProfile.role === 'tutor') {
        router.replace('/requests/browse');
      } else {
        router.replace('/'); // Fallback to home
      }
    }
  }, [user, userProfile, isUserLoading, isProfileLoading, router, toast]);

  const handleSelectRole = async (role: 'student' | 'tutor') => {
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'userProfiles', user.uid);
      setDocumentNonBlocking(userDocRef, { role: role }, { merge: true });
      toast({
        title: `تم تحديد دورك كـ ${role === 'student' ? 'مستفهم' : 'مفهّم'}!`,
      });
      if (role === 'student') {
        router.push('/requests/create');
      } else {
        router.push('/requests/browse');
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description: 'لم نتمكن من تحديث دورك.',
      });
    }
  };

  // While loading or if user already has a role (and is being redirected), show a loading state.
  if (isUserLoading || isProfileLoading || (user && userProfile?.role)) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.14))] flex-col items-center justify-center py-12 px-4">
        <div className="mx-auto w-full max-w-md text-center">
          <Skeleton className="h-9 w-48 mx-auto mb-2" />
          <Skeleton className="h-5 w-64 mx-auto" />
        </div>
        <div className="mt-8 grid w-full max-w-md grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      </div>
    );
  }

  // If loading is finished and user has no role, show the selection UI.
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.14))] flex-col items-center justify-center py-12 px-4">
      <div className="mx-auto w-full max-w-md text-center">
        <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.description}</p>
      </div>
      <div className="mt-8 grid w-full max-w-md grid-cols-1 gap-6 md:grid-cols-2">
        <Card
          onClick={() => handleSelectRole('student')}
          className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
        >
          <CardHeader className="items-center text-center">
            <div className="mb-4 rounded-full border border-primary/20 bg-primary/10 p-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>{t.student.title}</CardTitle>
            <CardDescription>{t.student.description}</CardDescription>
          </CardHeader>
        </Card>
        <Card
          onClick={() => handleSelectRole('tutor')}
          className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
        >
          <CardHeader className="items-center text-center">
            <div className="mb-4 rounded-full border border-primary/20 bg-primary/10 p-4">
              <UserIcon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>{t.tutor.title}</CardTitle>
            <CardDescription>{t.tutor.description}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
