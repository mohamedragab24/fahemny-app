'use client';

import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import type { SessionRequest, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import ar from '@/locales/ar';

// Helper to get user names
function UserInfo({ userId }: { userId?: string }) {
    const firestore = useFirestore();
    const userProfileRef = useMemoFirebase(
        () => (userId ? doc(firestore, 'userProfiles', userId) : null),
        [firestore, userId]
    );
    const { data: userProfile, isLoading } = useDoc<UserProfile>(userProfileRef);

    if (!userId) return <span className="text-muted-foreground">-</span>;
    if (isLoading) return <Skeleton className="h-5 w-24" />;
    return <span>{userProfile?.name || 'غير موجود'}</span>;
}


export default function AdminSessionsPage() {
  const t = ar.admin.sessions;
  const firestore = useFirestore();

  const sessionsQuery = useMemoFirebase(() => query(collection(firestore, 'sessionRequests'), orderBy('createdAt', 'desc')), [firestore]);
  const { data: sessions, isLoading } = useCollection<SessionRequest>(sessionsQuery);

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
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t.title}</CardTitle>
        <CardDescription>{t.page_description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="space-y-2">
                {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.table.title}</TableHead>
                <TableHead>{t.table.student}</TableHead>
                <TableHead>{t.table.tutor}</TableHead>
                <TableHead>{t.table.date}</TableHead>
                <TableHead>{t.table.price}</TableHead>
                <TableHead>{t.table.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions && sessions.length > 0 ? sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium max-w-xs truncate">{session.title}</TableCell>
                  <TableCell><UserInfo userId={session.studentId} /></TableCell>
                  <TableCell><UserInfo userId={session.tutorId} /></TableCell>
                  <TableCell>{new Date(session.createdAt).toLocaleDateString('ar-EG')}</TableCell>
                  <TableCell>{session.price} جنيه</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(session.status)}>{statusTranslations[session.status]}</Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center">{t.no_sessions}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
