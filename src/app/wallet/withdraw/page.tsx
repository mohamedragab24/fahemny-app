'use client';

import ar from '@/locales/ar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, doc, getDocs } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function WithdrawPage() {
  const t = ar.wallet.withdraw;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'userProfiles', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const currentBalance = userProfile?.balance ?? 0;

  const formSchema = z.object({
    amount: z.coerce.number()
        .min(100, t.min_amount_error)
        .max(currentBalance, t.amount_error),
    details: z.string().min(10, t.details_error),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 100,
      details: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !userProfile) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'يجب تسجيل الدخول أولاً.' });
        router.push('/login');
        return;
    }
    
    try {
        const withdrawalCollection = collection(firestore, 'withdrawalRequests');
        const newRequest = {
            userId: user.uid,
            userName: userProfile.name,
            amount: values.amount,
            details: values.details,
            status: 'pending' as const,
            createdAt: new Date().toISOString(),
        };
        addDocumentNonBlocking(withdrawalCollection, newRequest);

        // Notify admins
        const adminQuery = query(collection(firestore, 'userProfiles'), where('isAdmin', '==', true));
        const adminSnapshot = await getDocs(adminQuery);
        const notificationsCol = collection(firestore, 'notifications');
        adminSnapshot.forEach(adminDoc => {
            addDocumentNonBlocking(notificationsCol, {
                userId: adminDoc.id,
                title: ar.notifications.new_withdrawal_request_title,
                message: ar.notifications.new_withdrawal_request_message
                    .replace('{userName}', userProfile.name)
                    .replace('{amount}', values.amount.toString()),
                link: '/admin/withdrawals',
                isRead: false,
                createdAt: new Date().toISOString(),
            });
        });

        toast({
            title: t.success_toast_title,
            description: t.success_toast_description,
        });
        
        router.push('/wallet');

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'فشل إرسال الطلب',
            description: error.message || 'حدث خطأ غير متوقع.',
        });
    }
  }

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading) {
    return (
        <div className="container py-12 flex items-center justify-center min-h-[calc(100vh-theme(spacing.28))]">
            <Card className="max-w-lg w-full"><Skeleton className="h-96 w-full" /></Card>
        </div>
    );
  }

  if (userProfile?.role !== 'tutor') {
    return (
        <div className="container py-12 flex items-center justify-center min-h-[calc(100vh-theme(spacing.28))]">
            <Card className="max-w-lg w-full text-center p-8">
                <CardTitle>{t.title}</CardTitle>
                <CardDescription className="mt-4">هذه الميزة متاحة للمفهّمين فقط.</CardDescription>
                <Button onClick={() => router.push('/wallet')} className="mt-6">العودة للمحفظة</Button>
            </Card>
        </div>
    );
  }

  return (
    <div className="container py-12 flex items-center justify-center min-h-[calc(100vh-theme(spacing.28))]">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle className="font-headline">{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 rounded-md bg-secondary">
            <p className="text-sm text-secondary-foreground">الرصيد المتاح للسحب</p>
            <p className="text-2xl font-bold text-primary">{currentBalance.toFixed(2)} جنيه</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.amount_label}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={currentBalance <= 0}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.details_label}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t.details_placeholder} {...field} disabled={currentBalance <= 0}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || currentBalance <= 0}>
                {form.formState.isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {form.formState.isSubmitting ? t.submitting_button : t.submit_button}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
