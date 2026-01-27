'use client';

import ar from '@/locales/ar';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Transaction, UserProfile } from '@/lib/types';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet } from 'lucide-react';
import { useMemo } from 'react';

function UserCell({ userId, usersMap }: { userId: string, usersMap: Map<string, UserProfile> }) {
    const user = usersMap.get(userId);
    return (
        <div className="font-medium">{user?.name || userId}</div>
    );
}

export default function AdminTransactionsPage() {
    const t = ar.admin.transactions;
    const wallet_t = ar.wallet;
    const firestore = useFirestore();

    const transactionsQuery = useMemoFirebase(
        () => (firestore ? query(collection(firestore, 'transactions'), orderBy('createdAt', 'desc')) : null),
        [firestore]
    );
    const { data: transactions, isLoading: isLoadingTransactions } = useCollection<Transaction>(transactionsQuery);

    const usersQuery = useMemoFirebase(
        () => (firestore ? query(collection(firestore, 'userProfiles')) : null),
        [firestore]
    );
    const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);

    const usersMap = useMemo(() => {
        const map = new Map<string, UserProfile>();
        if (users) {
            for (const user of users) {
                map.set(user.id, user);
            }
        }
        return map;
    }, [users]);
  
    const getTransactionTypeTranslation = (type: Transaction['type']) => {
        return wallet_t.types[type] || type;
    };

    const isLoading = isLoadingTransactions || isLoadingUsers;

    return (
        <div>
            <h1 className="text-3xl font-bold font-headline mb-6">{t.title}</h1>
            <Card>
                <CardHeader>
                    <CardTitle>{t.title}</CardTitle>
                    <CardDescription>{t.page_description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t.user}</TableHead>
                                <TableHead>{wallet_t.table.description}</TableHead>
                                <TableHead>{wallet_t.table.type}</TableHead>
                                <TableHead>{wallet_t.table.date}</TableHead>
                                <TableHead className="text-left">{wallet_t.table.amount}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(10)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell className="text-left"><Skeleton className="h-5 w-16" /></TableCell>
                                    </TableRow>
                                ))
                            ) : transactions && transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell>
                                            <UserCell userId={tx.userId} usersMap={usersMap} />
                                        </TableCell>
                                        <TableCell className="font-medium">{tx.description}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{getTransactionTypeTranslation(tx.type)}</Badge>
                                        </TableCell>
                                        <TableCell>{new Date(tx.createdAt).toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit', year: 'numeric' })}</TableCell>
                                        <TableCell className={`text-left font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.amount.toFixed(2)} جنيه
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <Wallet className="h-12 w-12 text-muted-foreground" />
                                            <span>{t.no_transactions}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
