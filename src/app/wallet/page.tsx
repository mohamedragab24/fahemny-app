'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ar from '@/locales/ar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Wallet as WalletIcon } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import type { Transaction, UserProfile } from '@/lib/types';
import { collection, query, where, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function WalletPage() {
  const t = ar.wallet;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'userProfiles', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const transactionsQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, 'transactions'), where('userId', '==', user.uid)) : null),
    [firestore, user]
  );
  const { data: transactions, isLoading: isLoadingTransactions } = useCollection<Transaction>(transactionsQuery);

  const sortedTransactions = useMemo(() => {
    if (!transactions) return [];
    return [...transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions]);

  const currentBalance = userProfile?.balance ?? 0;
  
  const getTransactionTypeTranslation = (type: Transaction['type']) => {
    switch(type) {
      case 'deposit': return t.types.deposit;
      case 'session_payment': return t.types.session_payment;
      case 'session_payout': return t.types.session_payout;
      case 'withdrawal': return t.types.withdrawal;
      default: return type;
    }
  };

  const isLoading = isUserLoading || isLoadingTransactions || isProfileLoading;

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
  
  if (!user) {
    router.replace('/login');
    return null;
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
        <Button asChild>
            <Link href="/wallet/deposit">
              <PlusCircle className="me-2 h-4 w-4" />
              {t.add_balance_button}
            </Link>
        </Button>
      </div>
      
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>{t.transactions_history}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {sortedTransactions && sortedTransactions.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t.table.description}</TableHead>
                                    <TableHead>{t.table.type}</TableHead>
                                    <TableHead>{t.table.date}</TableHead>
                                    <TableHead className="text-left">{t.table.amount}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedTransactions.map((tx) => (
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
                            <p className="mt-4">{t.no_transactions}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        <div>
            <Card className="sticky top-20">
                <CardHeader>
                    <CardTitle>{t.current_balance_title}</CardTitle>
                    <CardDescription>{t.current_balance_description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold text-primary">{currentBalance.toFixed(2)}</p>
                    <p className="text-muted-foreground">جنيه مصري</p>
                </CardContent>
                {userProfile?.role === 'tutor' && (
                    <CardFooter>
                         <Button asChild className="w-full" disabled={currentBalance <= 0}>
                            <Link href="/wallet/withdraw">{t.withdraw_button}</Link>
                         </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
      </div>
    </div>
  );
}
