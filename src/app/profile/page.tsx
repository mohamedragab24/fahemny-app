'use client';

import ar from '@/locales/ar';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfilePage() {
  const t = ar.header.userMenu;
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold font-headline mb-6">{t.profile}</h1>
            <Skeleton className="h-64 w-full" />
        </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold font-headline mb-6">{t.profile}</h1>
      <Card>
          <CardHeader>
              <CardTitle>ملفك الشخصي</CardTitle>
              <CardDescription>هنا يمكنك عرض وتعديل معلومات حسابك.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.photoURL || ''} />
              <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
                <p className="text-2xl font-semibold">{user?.displayName || 'مستخدم جديد'}</p>
                <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </CardContent>
      </Card>
    </div>
  );
}
