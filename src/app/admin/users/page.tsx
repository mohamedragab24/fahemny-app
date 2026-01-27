'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, runTransaction, increment } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ar from '@/locales/ar';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import Link from 'next/link';
import { Loader2, PlusCircle } from 'lucide-react';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';


const addBalanceSchema = z.object({
  amount: z.coerce.number().min(1, "المبلغ يجب أن يكون أكبر من صفر"),
  description: z.string().min(5, "الوصف يجب أن يكون 5 أحرف على الأقل").max(100, "الوصف طويل جدًا"),
});

function getInitials(name?: string) {
    if (typeof name !== 'string' || !name) {
        return '?';
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
}


function AddBalanceDialog({ user }: { user: UserProfile }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof addBalanceSchema>>({
        resolver: zodResolver(addBalanceSchema),
        defaultValues: {
            amount: 50,
            description: '',
        },
    });

    const { formState: { isSubmitting } } = form;

    const onSubmit = async (values: z.infer<typeof addBalanceSchema>) => {
        try {
            await runTransaction(firestore, async (transaction) => {
                const userProfileRef = doc(firestore, 'userProfiles', user.id);
                
                transaction.update(userProfileRef, { balance: increment(values.amount) });

                const transactionCol = collection(firestore, 'transactions');
                const newTransactionRef = doc(transactionCol);
                transaction.set(newTransactionRef, {
                    userId: user.id,
                    type: 'deposit',
                    amount: values.amount,
                    description: values.description,
                    createdAt: new Date().toISOString()
                });
            });

            addDocumentNonBlocking(collection(firestore, 'notifications'), {
                userId: user.id,
                title: 'تمت إضافة رصيد إلى محفظتك',
                message: `أضاف المسؤول مبلغ ${values.amount} جنيه إلى رصيدك. السبب: ${values.description}`,
                link: '/wallet',
                isRead: false,
                createdAt: new Date().toISOString()
            });

            toast({ title: 'تمت الإضافة بنجاح', description: `تمت إضافة ${values.amount} جنيه إلى رصيد ${user.name}.` });
            setOpen(false);
            form.reset();

        } catch (e: any) {
            console.error("Add balance failed:", e);
            toast({ variant: 'destructive', title: 'فشلت الإضافة', description: e.message });
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <PlusCircle className="h-3 w-3" />
                    <span>رصيد</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>إضافة رصيد إلى: {user.name}</DialogTitle>
                    <DialogDescription>
                        هذا الإجراء سيضيف المبلغ مباشرة إلى محفظة المستخدم ويسجل معاملة جديدة.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="p-4 rounded-md bg-secondary border">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-secondary-foreground">الرصيد الحالي</p>
                                <p className="text-2xl font-bold text-primary">{(user.balance ?? 0).toFixed(2)} جنيه</p>
                            </div>
                             <Avatar className="h-12 w-12">
                                <AvatarImage src={user.photoURL} alt={user.name || ''} />
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{user.email}</p>
                    </div>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                             <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>المبلغ (بالجنيه)</FormLabel>
                                    <FormControl>
                                    <Input type="number" placeholder="100" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>سبب الإضافة (سيظهر للمستخدم)</FormLabel>
                                    <FormControl>
                                    <Input placeholder="مثال: جائزة مسابقة، تعويض عن مشكلة..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                    تأكيد الإضافة
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}


export default function AdminUsersPage() {
  const t = ar.admin.users;
  const firestore = useFirestore();
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(() => collection(firestore, 'userProfiles'), [firestore]);
  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  const handleToggleUserStatus = (user: UserProfile, isDisabled: boolean) => {
    const userRef = doc(firestore, 'userProfiles', user.id);
    updateDocumentNonBlocking(userRef, { disabled: isDisabled });
    toast({
        title: `تم ${isDisabled ? 'حظر' : 'تفعيل'} المستخدم`,
        description: `تم تحديث حالة المستخدم ${user.name}.`,
    });
  };
  
  const handleToggleAdminStatus = (user: UserProfile, isAdmin: boolean) => {
    const userRef = doc(firestore, 'userProfiles', user.id);
    updateDocumentNonBlocking(userRef, { isAdmin: isAdmin });
    toast({
        title: `تم تحديث صلاحيات المسؤول`,
        description: `تم ${isAdmin ? 'منح' : 'إزالة'} صلاحيات المسؤول للمستخدم ${user.name}.`,
    });
  };

  const sortedUsers = users?.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t.title}</CardTitle>
        <CardDescription>{t.users_list}</CardDescription>
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
                <TableHead>{t.table.role}</TableHead>
                <TableHead>الرصيد</TableHead>
                <TableHead>{t.table.joined_at}</TableHead>
                <TableHead>{t.table.is_admin}</TableHead>
                <TableHead className="text-center">{t.table.is_disabled}</TableHead>
                <TableHead className="text-center">{t.table.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers && sortedUsers.length > 0 ? sortedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Link href={`/users/${user.id}`} className="group/userlink">
                      <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                              <AvatarImage src={user.photoURL} alt={user.name || ''} />
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                              <span className="font-medium group-hover/userlink:underline">{user.name}</span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    {user.role ? (
                      <Badge variant="secondary">{user.role === 'student' ? 'مستفهم' : 'مفهّم'}</Badge>
                    ) : (
                      <span className="text-muted-foreground">لم يحدد</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono">{(user.balance ?? 0).toFixed(2)}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString('ar-EG')}</TableCell>
                   <TableCell>
                     <Switch
                        checked={!!user.isAdmin}
                        onCheckedChange={(isAdmin) => handleToggleAdminStatus(user, isAdmin)}
                        aria-label="Toggle Admin"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                        checked={!!user.disabled}
                        onCheckedChange={(isDisabled) => handleToggleUserStatus(user, isDisabled)}
                        aria-label="Toggle Disabled"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <AddBalanceDialog user={user} />
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={7} className="text-center">{t.no_users}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
