'use client';

import { useState, useEffect } from 'react';
import ar from '@/locales/ar';
import { useFirestore } from '@/firebase';
import { collection, query, doc, runTransaction, increment, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import type { WithdrawalRequest } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Check, X, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';


export default function AdminWithdrawalsPage() {
  const t = ar.admin.withdrawals;
  const firestore = useFirestore();
  const { toast } = useToast();
  const REQUESTS_PER_PAGE = 20;
  
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');

  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchRequests = async (loadMore = false) => {
    if (!hasMore && loadMore) return;
    
    try {
      if (loadMore) setIsLoadingMore(true);
      else setIsLoading(true);

      let q = query(
        collection(firestore, 'withdrawalRequests'),
        orderBy('createdAt', 'desc'),
        limit(REQUESTS_PER_PAGE)
      );

      if (loadMore && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const documentSnapshots = await getDocs(q);
      const newRequests = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawalRequest));
      
      setRequests(prev => loadMore ? [...prev, ...newRequests] : newRequests);
      
      const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(lastDoc);

      if (documentSnapshots.docs.length < REQUESTS_PER_PAGE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
      toast({ variant: 'destructive', title: 'فشل تحميل الطلبات' });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (request: WithdrawalRequest) => {
    setLoadingId(request.id);
    
    try {
        await runTransaction(firestore, async (transaction) => {
            const userProfileRef = doc(firestore, 'userProfiles', request.userId);
            const userProfileSnap = await transaction.get(userProfileRef);

            if (!userProfileSnap.exists() || (userProfileSnap.data().balance ?? 0) < request.amount) {
              throw new Error('رصيد المستخدم غير كافٍ لإتمام عملية السحب.');
            }

            transaction.update(userProfileRef, { balance: increment(-request.amount) });
            const requestRef = doc(firestore, 'withdrawalRequests', request.id);
            transaction.update(requestRef, { status: 'approved' });

            const transactionCol = collection(firestore, 'transactions');
            const newTransactionRef = doc(transactionCol);
            transaction.set(newTransactionRef, {
                userId: request.userId,
                type: 'withdrawal',
                amount: -request.amount,
                description: `سحب رصيد بقيمة ${request.amount} جنيه`,
                createdAt: new Date().toISOString()
            });
        });

        addDocumentNonBlocking(collection(firestore, 'notifications'), {
            userId: request.userId,
            title: ar.notifications.withdrawal_approved_title,
            message: ar.notifications.withdrawal_approved_message.replace('{amount}', request.amount.toString()),
            link: '/wallet',
            isRead: false,
            createdAt: new Date().toISOString()
        });

        toast({ title: 'تمت الموافقة بنجاح' });
        setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'approved' } : r));

    } catch (e: any) {
        console.error("Approval failed:", e);
        toast({ variant: 'destructive', title: 'فشلت الموافقة', description: e.message });
    } finally {
        setLoadingId(null);
    }
  };

  const handleReject = (request: WithdrawalRequest) => {
    setLoadingId(request.id);
    
    const requestRef = doc(firestore, 'withdrawalRequests', request.id);
    updateDocumentNonBlocking(requestRef, { status: 'rejected', adminNotes: rejectionNotes });

    addDocumentNonBlocking(collection(firestore, 'notifications'), {
        userId: request.userId,
        title: ar.notifications.withdrawal_rejected_title,
        message: ar.notifications.withdrawal_rejected_message.replace('{reason}', rejectionNotes || 'لا يوجد سبب'),
        link: '/wallet',
        isRead: false,
        createdAt: new Date().toISOString()
    });

    toast({ title: 'تم الرفض بنجاح' });
    setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'rejected', adminNotes: rejectionNotes } : r));
    setLoadingId(null);
    setRejectionNotes('');
  };

  const getStatusVariant = (status: WithdrawalRequest['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };
  const statusTranslations: Record<WithdrawalRequest['status'], string> = {
      pending: 'قيد المراجعة',
      approved: 'تمت الموافقة',
      rejected: 'مرفوض',
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
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.table.user}</TableHead>
                <TableHead>{t.table.amount}</TableHead>
                <TableHead>{t.table.details}</TableHead>
                <TableHead>{t.table.date}</TableHead>
                <TableHead>{t.table.status}</TableHead>
                <TableHead className="text-center">{t.table.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length > 0 ? requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="font-medium">{request.userName}</div>
                  </TableCell>
                  <TableCell>{request.amount} جنيه</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{request.details}</TableCell>
                  <TableCell>{new Date(request.createdAt).toLocaleDateString('ar-EG')}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(request.status)}>{statusTranslations[request.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {request.status === 'pending' && (
                        <div className="flex gap-2 justify-center">
                        {loadingId === request.id ? <Loader2 className="animate-spin" /> : (
                            <>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline"><Check className="w-4 h-4" /></Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{t.approve_dialog_title}</DialogTitle>
                                        <DialogDescription>
                                            {t.approve_dialog_description.replace('{amount}', request.amount.toString()).replace('{userName}', request.userName)}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogTrigger asChild><Button variant="ghost">إلغاء</Button></DialogTrigger>
                                        <DialogTrigger asChild>
                                            <Button onClick={() => handleApprove(request)}>تأكيد الموافقة</Button>
                                        </DialogTrigger>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="destructive"><X className="w-4 h-4" /></Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{t.reject_dialog_title}</DialogTitle>
                                        <DialogDescription>{t.reject_dialog_description}</DialogDescription>
                                    </DialogHeader>
                                    <Textarea 
                                        placeholder={t.admin_notes_placeholder}
                                        value={rejectionNotes}
                                        onChange={(e) => setRejectionNotes(e.target.value)}
                                        className="my-4"
                                    />
                                    <DialogFooter>
                                        <DialogTrigger asChild><Button variant="ghost">إلغاء</Button></DialogTrigger>
                                         <DialogTrigger asChild>
                                            <Button variant="destructive" onClick={() => handleReject(request)}>تأكيد الرفض</Button>
                                         </DialogTrigger>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                           </>
                        )}
                        </div>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">{t.no_requests}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
       {hasMore && (
        <CardFooter className="justify-center">
          <Button onClick={() => fetchRequests(true)} disabled={isLoadingMore}>
            {isLoadingMore && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            تحميل المزيد
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
