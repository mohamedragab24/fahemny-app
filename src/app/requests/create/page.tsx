'use client';

import ar from '@/locales/ar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const requestSchema = z.object({
  title: z.string().min(10, 'العنوان يجب أن يكون 10 أحرف على الأقل'),
  field: z.string().min(3, 'المجال يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().min(25, 'التفاصيل يجب أن تكون 25 حرفًا على الأقل'),
  price: z.coerce.number().min(50, 'الحد الأدنى للسعر هو 50 جنيهًا'),
  tutorGender: z.enum(['any', 'male', 'female'], { required_error: 'الرجاء اختيار جنس المفهّم' }),
  sessionDate: z.string().min(1, 'تاريخ الجلسة مطلوب').refine((date) => new Date(date) >= new Date(new Date().setDate(new Date().getDate() - 1)), {
    message: 'تاريخ الجلسة يجب أن يكون اليوم أو في المستقبل',
  }),
  sessionTime: z.string().min(1, 'وقت الجلسة مطلوب'),
});

export default function CreateRequestPage() {
  const t = ar.header.links;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'userProfiles', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: '',
      field: '',
      description: '',
      price: 50,
      tutorGender: 'any',
      sessionDate: '',
      sessionTime: '',
    },
  });

  async function onSubmit(values: z.infer<typeof requestSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'يجب تسجيل الدخول لنشر طلب.',
      });
      return;
    }
    
    if (userProfile?.role !== 'student') {
       toast({
        variant: 'destructive',
        title: 'غير مصرح به',
        description: 'هذه الصفحة مخصصة للمستفهمين فقط.',
      });
      return;
    }

    try {
      const requestsCollection = collection(firestore, 'sessionRequests');
      const newRequest = {
          ...values,
          studentId: user.uid,
          status: 'open' as 'open',
          createdAt: new Date().toISOString(),
      };

      addDocumentNonBlocking(requestsCollection, newRequest);

      toast({
          title: 'تم نشر طلبك بنجاح!',
          description: 'سيتم توجيهك الآن إلى صفحة الدفع (محاكاة).',
      });
      
      router.push('/payment');

    } catch (error: any) {
      console.error("Failed to create request:", error);
      toast({
        variant: 'destructive',
        title: 'فشل نشر الطلب',
        description: 'حدث خطأ غير متوقع.'
      });
    }
  }
  
  if (isUserLoading || isProfileLoading) {
    return (
       <div className="container py-12">
           <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-2/3 mt-2" />
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-20 w-full" /></div>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
           </Card>
       </div>
    )
  }

  if (!user) {
      router.replace('/login');
      return null;
  }
  
  if (userProfile?.role !== 'student') {
    return (
        <div className="container py-12">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline">{t.create_request}</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-6">
                    <p className="text-muted-foreground">هذه الصفحة متاحة للمستفهمين فقط.</p>
                     <Button onClick={() => router.push('/select-role')} className="mt-4">تغيير الدور</Button>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">{t.create_request}</CardTitle>
          <CardDescription>املأ النموذج التالي لنشر طلبك والانتقال إلى صفحة الدفع.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان الطلب</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: أحتاج مساعدة في معادلات الدرجة الثانية" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="field"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المجال</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: الرياضيات، البرمجة، التصميم" {...field} />
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
                    <FormLabel>التفاصيل</FormLabel>
                    <FormControl>
                      <Textarea placeholder="اشرح بالتفصيل ما الذي تحتاج إلى فهمه..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>السعر (بالجنيه المصري)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tutorGender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>جنس المفهّم المطلوب</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="any">الكل</SelectItem>
                          <SelectItem value="male">ذكر</SelectItem>
                          <SelectItem value="female">أنثى</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="sessionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ الجلسة</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sessionTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>وقت الجلسة</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جارٍ النشر...
                    </>
                ) : 'نشر الطلب والانتقال للدفع'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
