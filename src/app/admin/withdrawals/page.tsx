'use client';

import { useState } from 'react';
import ar from '@/locales/ar';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { WithdrawalRequest } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');

  const requestsQuery = useMemoFirebase(() => query(collection(firestore, 'withdrawalRequests'), orderBy('createdAt', 'desc')), [firestore]);
  const { data: requests, isLoading } = useCollection<WithdrawalRequest>(requestsQuery);

  const handleApprove = (request: WithdrawalRequest) => {
    setLoadingId(request.id);
    
    // 1. Update request status
    const requestRef = doc(firestore, 'withdrawalRequests', request.id);
    updateDocumentNonBlocking(requestRef, { status: 'approved' });

    // 2. Create a withdrawal transaction
    const transactionCol = collection(firestore, 'transactions');
    addDocumentNonBlocking(transactionCol, {
        userId: request.userId,
        type: 'withdrawal',
        amount: -request.amount,
        description: `سحب رصيد بقيمة ${request.amount} جنيه`,
        createdAt: new Date().toISOString()
    });

    // 3. Notify user
    const notificationCol = collection(firestore, 'notifications');
    addDocumentNonBlocking(notificationCol, {
        userId: request.userId,
        title: ar.notifications.withdrawal_approved_title,
        message: ar.notifications.withdrawal_approved_message.replace('{amount}', request.amount.toString()),
        link: '/wallet',
        isRead: false,
        createdAt: new Date().toISOString()
    });

    toast({ title: 'تمت الموافقة بنجاح' });
    setLoadingId(null);
  };

  const handleReject = (request: WithdrawalRequest) => {
    setLoadingId(request.id);
    
    // 1. Update request status with admin notes
    const requestRef = doc(firestore, 'withdrawalRequests', request.id);
    updateDocumentNonBlocking(requestRef, { status: 'rejected', adminNotes: rejectionNotes });

    // 2. Notify user
    const notificationCol = collection(firestore, 'notifications');
    addDocumentNonBlocking(notificationCol, {
        userId: request.userId,
        title: ar.notifications.withdrawal_rejected_title,
        message: ar.notifications.withdrawal_rejected_message.replace('{reason}', rejectionNotes || 'لا يوجد سبب'),
        link: '/wallet',
        isRead: false,
        createdAt: new Date().toISOString()
    });

    toast({ title: 'تم الرفض بنجاح' });
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
              {requests && requests.length > 0 ? requests.map((request) => (
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
                    <TableCell colSpan={6} className="text-center">{t.no_requests}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
