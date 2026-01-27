'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import ar from '@/locales/ar';
import { UserInfoLink } from '@/components/UserInfoLink';


function UserInfo({ userId }: { userId: string }) {
    return (
         <div className="flex flex-col">
            <UserInfoLink userId={userId} className="font-medium text-sm text-primary" />
            <span className="text-xs text-muted-foreground font-mono">{userId}</span>
        </div>
    );
}

export default function AdminTransactionsPage() {
  const t = ar.admin.transactions;
  const t_wallet = ar.wallet;
  const firestore = useFirestore();

  const transactionsQuery = useMemoFirebase(() => query(collection(firestore, 'transactions'), orderBy('createdAt', 'desc')), [firestore]);
  const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery);

  const getTransactionTypeTranslation = (type: Transaction['type']) => {
    switch(type) {
      case 'deposit': return t_wallet.types.deposit;
      case 'session_payment': return t_wallet.types.session_payment;
      case 'session_payout': return t_wallet.types.session_payout;
      case 'withdrawal': return t_wallet.types.withdrawal;
      default: return type;
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
                <TableHead>{t.user}</TableHead>
                <TableHead>{t_wallet.table.description}</TableHead>
                <TableHead>{t_wallet.table.type}</TableHead>
                <TableHead>{t_wallet.table.date}</TableHead>
                <TableHead className="text-left">{t_wallet.table.amount}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions && transactions.length > 0 ? transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <UserInfo userId={tx.userId} />
                  </TableCell>
                  <TableCell className="font-medium">{tx.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getTransactionTypeTranslation(tx.type)}</Badge>
                  </TableCell>
                  <TableCell>{new Date(tx.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</TableCell>
                  <TableCell className={`text-left font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount.toFixed(2)} جنيه
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center">{t.no_transactions}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
