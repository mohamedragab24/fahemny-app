'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ar from '@/locales/ar';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Notification } from '@/lib/types';
import { collection, query, where, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { formatDistanceToNow } from 'date-fns';
import { ar as arLocale } from 'date-fns/locale';

export default function NotificationsPage() {
  const t = ar.notifications;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const notificationsQuery = useMemoFirebase(
    () => user ? query(collection(firestore, 'notifications'), where('userId', '==', user.uid)) : null,
    [firestore, user]
  );
  const { data: rawNotifications, isLoading } = useCollection<Notification>(notificationsQuery);

  const notifications = useMemo(() => {
    if (!rawNotifications) return [];
    return rawNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [rawNotifications]);

  const unreadCount = useMemo(() => notifications?.filter(n => !n.isRead).length || 0, [notifications]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      const notifRef = doc(firestore, 'notifications', notification.id);
      updateDocumentNonBlocking(notifRef, { isRead: true });
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const markAllAsRead = () => {
    if (!notifications) return;
    notifications.forEach(notification => {
      if (!notification.isRead) {
        const notifRef = doc(firestore, 'notifications', notification.id);
        updateDocumentNonBlocking(notifRef, { isRead: true });
      }
    });
  };

  if (isLoading || isUserLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" onClick={markAllAsRead}>
            <CheckCheck className="me-2 h-4 w-4" />
            وضع علامة "مقروء" على الكل
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {notifications && notifications.length > 0 ? (
            <ul className="divide-y">
              {notifications.map(notification => (
                <li
                  key={notification.id}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-secondary/50 transition-colors",
                    !notification.isRead && "bg-primary/5"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", !notification.isRead ? "bg-primary" : "bg-transparent")} />
                    <div className="flex-grow">
                      <p className="font-semibold">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: arLocale })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <Bell className="mx-auto h-12 w-12" />
              <p className="mt-4">{t.no_notifications}</p>
              <CardDescription className="mt-2">عندما يكون هناك جديد، سيظهر هنا.</CardDescription>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
