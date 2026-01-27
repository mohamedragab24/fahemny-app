'use client';

import ar from '@/locales/ar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Loader2 } from 'lucide-react';

const depositSchema = z.object({
  amount: z.coerce.number().min(50, ar.wallet.deposit.min_amount_error),
});

export default function DepositPage() {
  const t = ar.wallet.deposit;
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof depositSchema>>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: 100,
    },
  });

  function onSubmit(values: z.infer<typeof depositSchema>) {
    if (!user) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'يجب تسجيل الدخول أولاً.' });
        router.push('/login');
        return;
    }
    
    const transactionsCollection = collection(firestore, 'transactions');
    const newTransaction = {
        userId: user.uid,
        type: 'deposit' as const,
        amount: values.amount,
        description: `إيداع رصيد في المحفظة`,
        createdAt: new Date().toISOString(),
    };

    addDocumentNonBlocking(transactionsCollection, newTransaction);
    
    toast({
        title: t.success_toast_title,
        description: `تم إضافة ${values.amount} جنيه إلى رصيدك.`,
    });
    
    router.push('/wallet');
  }

  return (
    <div className="container py-12 flex items-center justify-center min-h-[calc(100vh-theme(spacing.28))]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="font-headline">{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.amount_label}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={t.amount_placeholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-sm text-muted-foreground">{t.info_text}</p>
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
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
