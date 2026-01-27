'use client';

import ar from '@/locales/ar';
import { useUser, useFirestore, useDoc, useMemoFirebase, useStorage } from '@/firebase';
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
import { Loader2, Star, Pencil } from 'lucide-react';
import { useState, useRef } from 'react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const profileFormSchema = z.object({
  name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
});

export default function ProfilePage() {
  const t = ar.header.userMenu;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'userProfiles', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    values: {
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage || !user) return;

    setIsUploading(true);

    try {
      const sRef = storageRef(storage, `profile-pictures/${user.uid}`);
      const uploadResult = await uploadBytes(sRef, selectedImage);
      const photoURL = await getDownloadURL(uploadResult.ref);
      
      const userDocRef = doc(firestore, 'userProfiles', user.uid);
      setDocumentNonBlocking(userDocRef, { photoURL }, { merge: true });

      toast({
        title: 'تم تحديث الصورة',
        description: 'تم تحديث صورة ملفك الشخصي بنجاح.',
      });
    } catch (error: any) {
      console.error("Image upload failed:", error);
      toast({
        variant: 'destructive',
        title: 'فشل رفع الصورة',
        description: 'حدث خطأ أثناء رفع الصورة. الرجاء التأكد من أن حجم الصورة مناسب والمحاولة مرة أخرى.',
      });
    } finally {
      setIsUploading(false);
      setSelectedImage(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
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
                    <div className="relative">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={previewUrl || userProfile.photoURL || undefined} alt={userProfile.name} />
                            <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
                        </Avatar>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">تغيير الصورة</span>
                        </Button>
                         <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </div>

                     {selectedImage && (
                        <div className="w-full flex flex-col items-center gap-2 pt-2">
                            <p className="text-sm text-muted-foreground truncate max-w-full px-4">{selectedImage.name}</p>
                            <div className="flex gap-2">
                                <Button onClick={handleUpload} disabled={isUploading}>
                                    {isUploading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                    {isUploading ? 'جارٍ الرفع...' : 'حفظ الصورة'}
                                </Button>
                                <Button variant="ghost" onClick={() => {
                                    setSelectedImage(null);
                                    setPreviewUrl(null);
                                    if(fileInputRef.current) fileInputRef.current.value = "";
                                }} disabled={isUploading}>
                                    إلغاء
                                </Button>
                            </div>
                        </div>
                    )}
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
