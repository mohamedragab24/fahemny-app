'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import type { SessionRequest } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import ar from '@/locales/ar';
import { UserInfoLink } from '@/components/UserInfoLink';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSessionsPage() {
  const t = ar.admin.sessions;
  const firestore = useFirestore();
  const { toast } = useToast();
  const SESSIONS_PER_PAGE = 20;

  const [sessions, setSessions] = useState<SessionRequest[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchSessions = async (loadMore = false) => {
    if (!hasMore && loadMore) return;
    
    try {
      if (loadMore) setIsLoadingMore(true);
      else setIsLoading(true);

      let q = query(
        collection(firestore, 'sessionRequests'),
        orderBy('createdAt', 'desc'),
        limit(SESSIONS_PER_PAGE)
      );

      if (loadMore && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const documentSnapshots = await getDocs(q);
      const newSessions = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as SessionRequest));
      
      setSessions(prev => loadMore ? [...prev, ...newSessions] : newSessions);
      
      const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(lastDoc);

      if (documentSnapshots.docs.length < SESSIONS_PER_PAGE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast({ variant: 'destructive', title: 'فشل تحميل الجلسات' });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

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
              {sessions.length > 0 ? sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium max-w-xs truncate">{session.title}</TableCell>
                  <TableCell><UserInfoLink userId={session.studentId} /></TableCell>
                  <TableCell><UserInfoLink userId={session.tutorId} /></TableCell>
                  <TableCell>{new Date(session.createdAt).toLocaleDateString('ar-EG')}</TableCell>
                  <TableCell>{session.price} جنيه</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(session.status)}>{statusTranslations[session.status]}</Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">{t.no_sessions}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {hasMore && (
        <CardFooter className="justify-center">
          <Button onClick={() => fetchSessions(true)} disabled={isLoadingMore}>
            {isLoadingMore && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            تحميل المزيد
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
