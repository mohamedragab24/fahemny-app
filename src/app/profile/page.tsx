'use client';

import ar from '@/locales/ar';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Loader2, Star } from 'lucide-react';

const profileFormSchema = z.object({
  name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
});

export default function ProfilePage() {
  const t = ar.header.userMenu;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'userProfiles', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    values: { // Use 'values' to sync form with fetched data
      name: userProfile?.name || '',
    },
  });

  const onSubmit = (data: z.infer<typeof profileFormSchema>) => {
    if (!user) return;
    const userDocRef = doc(firestore, 'userProfiles', user.uid);
    setDocumentNonBlocking(userDocRef, data, { merge: true });
    toast({
      title: 'تم تحديث الملف الشخصي',
      description: 'تم حفظ اسمك الجديد بنجاح.',
    });
  };

  const getInitials = (name?: string | null) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.email?.[0].toUpperCase();
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold font-headline mb-6">{t.profile}</h1>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
          <div>
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!user || !userProfile) {
      return null;
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold font-headline mb-6">{t.profile}</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>تعديل الملف الشخصي</CardTitle>
                  <CardDescription>قم بتحديث معلوماتك الشخصية هنا.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاسم الكامل</FormLabel>
                        <FormControl>
                          <Input placeholder="اسمك الكامل" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <Input value={userProfile.email} disabled />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
                    {form.formState.isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                    حفظ التغييرات
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>صورة الملف الشخصي</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24">
                    <AvatarImage src={userProfile.photoURL || undefined} />
                    <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" disabled>تغيير الصورة (قريباً)</Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>دورك وتقييمك</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <p className="text-lg font-semibold capitalize">{userProfile.role === 'student' ? 'مستفهم' : 'مفهّم'}</p>
                    {userProfile.rating && (
                        <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-5 h-5 fill-current" />
                            <span className="font-bold text-lg">{userProfile.rating.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">/ 5.0</span>
                        </div>
                    )}
                     <Button variant="outline" disabled>تغيير الدور (قريباً)</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
