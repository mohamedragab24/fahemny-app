'use client';

import { useMemo } from 'react';
import ar from '@/locales/ar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Download, Wallet as WalletIcon, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Transaction } from '@/lib/types';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function WalletPage() {
  const t = ar.header.links;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const transactionsQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, 'transactions'), where('userId', '==', user.uid)) : null),
    [firestore, user]
  );
  const { data: transactions, isLoading: isLoadingTransactions } = useCollection<Transaction>(transactionsQuery);

  const currentBalance = useMemo(() => {
    if (!transactions) return 0;
    return transactions.reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions]);
  
  const getTransactionTypeTranslation = (type: Transaction['type']) => {
    switch(type) {
      case 'deposit': return 'إيداع';
      case 'session_payment': return 'دفع جلسة';
      case 'session_payout': return 'أرباح جلسة';
      case 'withdrawal': return 'سحب رصيد';
      default: return type;
    }
  };

  const isLoading = isUserLoading || isLoadingTransactions;

  if (isLoading) {
    return (
        <div className="container py-8">
            <Skeleton className="h-9 w-48 mb-6" />
            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Skeleton className="h-96 w-full" />
                </div>
                <div>
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">{t.wallet}</h1>
        <Button disabled>
            <PlusCircle className="me-2 h-4 w-4" />
            إضافة رصيد (قريباً)
        </Button>
      </div>
      
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>سجل المعاملات</CardTitle>
                        <Button variant="outline" size="sm" disabled>
                            <Download className="me-2 h-4 w-4" />
                            تصدير
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {transactions && transactions.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الوصف</TableHead>
                                    <TableHead>النوع</TableHead>
                                    <TableHead>التاريخ</TableHead>
                                    <TableHead className="text-left">المبلغ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="font-medium">{tx.description}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{getTransactionTypeTranslation(tx.type)}</Badge>
                                        </TableCell>
                                        <TableCell>{new Date(tx.createdAt).toLocaleDateString('ar-EG')}</TableCell>
                                        <TableCell className={`text-left font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.amount.toFixed(2)} جنيه
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <WalletIcon className="mx-auto h-12 w-12" />
                            <p className="mt-4">لا توجد معاملات لعرضها.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        <div>
            <Card className="sticky top-20">
                <CardHeader>
                    <CardTitle>رصيدك الحالي</CardTitle>
                    <CardDescription>هذا هو المبلغ المتاح في حسابك.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold text-primary">{currentBalance.toFixed(2)}</p>
                    <p className="text-muted-foreground">جنيه مصري</p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" disabled>سحب الأرباح (قريباً)</Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
