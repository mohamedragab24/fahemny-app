'use client';

import { useState, useMemo, useEffect } from 'react';
import ar from '@/locales/ar';
import { useFirestore } from '@/firebase';
import { collection, query, doc, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import type { ContactMessage } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function AdminSupportPage() {
  const t = ar.admin.support;
  const firestore = useFirestore();
  const { toast } = useToast();
  const MESSAGES_PER_PAGE = 20;

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchMessages = async (loadMore = false) => {
    if (!hasMore && loadMore) return;
    
    try {
      if (loadMore) setIsLoadingMore(true);
      else setIsLoading(true);

      let q = query(
        collection(firestore, 'contactMessages'),
        orderBy('createdAt', 'desc'),
        limit(MESSAGES_PER_PAGE)
      );

      if (loadMore && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const documentSnapshots = await getDocs(q);
      const newMessages = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMessage));
      
      setMessages(prev => loadMore ? [...prev, ...newMessages] : newMessages);
      
      const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(lastDoc);

      if (documentSnapshots.docs.length < MESSAGES_PER_PAGE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({ variant: 'destructive', title: 'فشل تحميل الرسائل' });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleStatusChange = (messageId: string, status: ContactMessage['status']) => {
    const messageRef = doc(firestore, 'contactMessages', messageId);
    updateDocumentNonBlocking(messageRef, { status });
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status } : m));
  };

  const getStatusVariant = (status: ContactMessage['status']): "default" | "secondary" | "outline" => {
    switch (status) {
      case 'new': return 'default';
      case 'read': return 'secondary';
      case 'closed': return 'outline';
      default: return 'secondary';
    }
  };
  const statusTranslations: Record<ContactMessage['status'], string> = {
      new: t.status_new,
      read: t.status_read,
      closed: t.status_closed,
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.table.name}</TableHead>
                <TableHead>{t.table.subject}</TableHead>
                <TableHead>{t.table.date}</TableHead>
                <TableHead>{t.table.status}</TableHead>
                <TableHead className="text-center">{t.table.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.length > 0 ? messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>
                    <div className="font-medium">{message.name}</div>
                    <div className="text-sm text-muted-foreground">{message.email}</div>
                  </TableCell>
                  <TableCell className="font-medium max-w-xs truncate">{message.subject}</TableCell>
                  <TableCell>{format(new Date(message.createdAt), 'yyyy/MM/dd')}</TableCell>
                  <TableCell>
                    <Select onValueChange={(value: ContactMessage['status']) => handleStatusChange(message.id, value)} defaultValue={message.status}>
                        <SelectTrigger className="w-32">
                           <Badge variant={getStatusVariant(message.status)} className="me-2 text-xs leading-4">●</Badge>
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="new">{statusTranslations.new}</SelectItem>
                            <SelectItem value="read">{statusTranslations.read}</SelectItem>
                            <SelectItem value="closed">{statusTranslations.closed}</SelectItem>
                        </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                     <Dialog>
                        <DialogTrigger asChild>
                            <Button size="icon" variant="ghost"><Eye className="w-4 h-4" /></Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{message.subject}</DialogTitle>
                                <DialogDescription>
                                    من: {message.name} ({message.email})
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 whitespace-pre-wrap">{message.message}</div>
                        </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">{t.no_messages}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
       {hasMore && (
        <CardFooter className="justify-center">
          <Button onClick={() => fetchMessages(true)} disabled={isLoadingMore}>
            {isLoadingMore && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            تحميل المزيد
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
