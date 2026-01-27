'use client';

import { useParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Briefcase, CalendarDays, ShieldCheck } from 'lucide-react';
import ar from '@/locales/ar';

function getInitials(name?: string | null) {
  if (typeof name !== 'string' || !name) {
    return '?';
  }
  return name.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
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

          {/* This section can be extended later to show reviews or session history */}
          <div className="mt-8">
            <h3 className="text-xl font-headline font-semibold mb-4 text-center">سجل النشاط</h3>
            <p className="text-center text-muted-foreground">
                سيتم عرض سجل الجلسات المكتملة والتقييمات هنا قريبًا.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
