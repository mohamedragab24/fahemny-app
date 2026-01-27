'use client';

import ar from '@/locales/ar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Download } from 'lucide-react';

export default function WalletPage() {
  const t = ar.header.links;
  
  // Dummy data for transactions
  const transactions = [
    { id: '1', type: 'إيداع', date: '25 يوليو 2024', amount: '+ 500.00 جنيه', status: 'مكتمل' },
    { id: '2', type: 'جلسة', date: '24 يوليو 2024', amount: '- 75.00 جنيه', status: 'مكتمل' },
    { id: '3', type: 'سحب أرباح', date: '22 يوليو 2024', amount: '- 300.00 جنيه', status: 'قيد المراجعة' },
    { id: '4', type: 'جلسة', date: '20 يوليو 2024', amount: '- 50.00 جنيه', status: 'مكتمل' },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'مكتمل':
        return 'outline';
      case 'قيد المراجعة':
        return 'secondary';
      default:
        return 'default';
    }
  };


  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">{t.wallet}</h1>
        <Button>
            <PlusCircle className="me-2 h-4 w-4" />
            إضافة رصيد
        </Button>
      </div>
      
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>سجل المعاملات</CardTitle>
                        <Button variant="outline" size="sm">
                            <Download className="me-2 h-4 w-4" />
                            تصدير
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>النوع</TableHead>
                                <TableHead>التاريخ</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead className="text-left">المبلغ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell>{tx.type}</TableCell>
                                    <TableCell>{tx.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(tx.status) as any}>{tx.status}</Badge>
                                    </TableCell>
                                    <TableCell className={`text-left font-medium ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.amount}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
                    <p className="text-4xl font-bold text-primary">375.00</p>
                    <p className="text-muted-foreground">جنيه مصري</p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full">سحب الأرباح</Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
