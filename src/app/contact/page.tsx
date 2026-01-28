'use client';

import ar from '@/locales/ar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const contactSchema = z.object({
  name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  email: z.string().email('بريد إلكتروني غير صالح'),
  subject: z.string().min(5, 'الموضوع يجب أن يكون 5 أحرف على الأقل'),
  message: z.string().min(20, 'الرسالة يجب أن تكون 20 حرفًا على الأقل'),
});

export default function ContactPage() {
    const t = ar.contact;
    const firestore = useFirestore();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof contactSchema>>({
        resolver: zodResolver(contactSchema),
        defaultValues: { name: '', email: '', subject: '', message: '' },
    });

    async function onSubmit(values: z.infer<typeof contactSchema>) {
        try {
            const messagesCollection = collection(firestore, 'contactMessages');
            const newMessage = {
                ...values,
                status: 'new' as const,
                createdAt: new Date().toISOString(),
            };
            await addDocumentNonBlocking(messagesCollection, newMessage);
            toast({
                title: t.success_toast_title,
                description: t.success_toast_description,
            });
            form.reset();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: t.error_toast_title,
                description: error.message,
            });
        }
    }

  return (
    <div className="container py-12 flex items-center justify-center min-h-[calc(100vh-theme(spacing.28))]">
      <Card className="max-w-xl w-full">
        <CardHeader>
          <CardTitle className="font-headline">{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.name_label}</FormLabel>
                        <FormControl><Input placeholder={t.name_placeholder} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.email_label}</FormLabel>
                        <FormControl><Input type="email" placeholder={t.email_placeholder} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.subject_label}</FormLabel>
                        <FormControl><Input placeholder={t.subject_placeholder} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.message_label}</FormLabel>
                        <FormControl><Textarea placeholder={t.message_placeholder} rows={5} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                 {form.formState.isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                 {t.submit_button}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
