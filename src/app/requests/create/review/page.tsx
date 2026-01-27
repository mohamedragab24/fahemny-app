'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ArrowLeft } from 'lucide-react';

const requestSchema = z.object({
  title: z.string(),
  field: z.string(),
  description: z.string(),
  price: z.number(),
  tutorGender: z.enum(['any', 'male', 'female']),
  sessionDate: z.string(),
  sessionTime: z.string(),
});
type RequestData = z.infer<typeof requestSchema>;

export default function ReviewRequestPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const savedData = sessionStorage.getItem('newRequestData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setRequestData(parsedData);
      } catch (e) {
        console.error("Failed to parse request data from sessionStorage", e);
        toast({ variant: 'destructive', title: 'خطأ', description: 'لم نتمكن من استعادة تفاصيل الطلب.' });
        router.replace('/requests/create');
      }
    } else {
      toast({ title: 'لا يوجد طلب للمراجعة', description: 'الرجاء ملء النموذج أولاً.', variant: 'destructive' });
      router.replace('/requests/create');
    }
  }, [router, toast]);
  
  const handleConfirm = async () => {
    if (!user || !requestData) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'بيانات الطلب أو المستخدم غير موجودة.' });
        return;
    }
    
    setIsSubmitting(true);

    try {
        const requestsCollection = collection(firestore, 'sessionRequests');
        const newRequest = {
            ...requestData,
            studentId: user.uid,
            status: 'open' as 'open',
            createdAt: new Date().toISOString(),
        };

        addDocumentNonBlocking(requestsCollection, newRequest);
        sessionStorage.removeItem('newRequestData');

        toast({
            title: 'تم تأكيد طلبك!',
            description: 'سيتم توجيهك الآن إلى صفحة الدفع (محاكاة).',
        });
        
        router.push('/payment');

    } catch (error) {
        console.error("Failed to create request:", error);
        toast({ variant: 'destructive', title: 'فشل نشر الطلب', description: 'حدث خطأ غير متوقع.' });
        setIsSubmitting(false);
    }
  };

  if (!requestData) {
    return (
        <div className="container py-12">
           <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-5 w-3/4 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <div className="flex justify-between gap-4 pt-4">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardContent>
           </Card>
       </div>
    );
  }
  
  const genderMap = {
      'any': 'الكل',
      'male': 'ذكر',
      'female': 'أنثى'
  } as const;

  return (
     <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">مراجعة الطلب</CardTitle>
          <CardDescription>الرجاء التأكد من صحة جميع التفاصيل قبل تأكيد الطلب والانتقال إلى الدفع.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-4 rounded-lg border bg-secondary/50 p-4">
                <h3 className="font-semibold text-lg">{requestData.title}</h3>
                <p className="text-sm text-muted-foreground"><strong>المجال:</strong> {requestData.field}</p>
                <p className="text-sm">{requestData.description}</p>
                <div className="border-t pt-4 mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <p><strong>التاريخ والوقت:</strong> {new Date(requestData.sessionDate).toLocaleDateString('ar-EG')} - {requestData.sessionTime}</p>
                    <p><strong>جنس المفهّم:</strong> {genderMap[requestData.tutorGender]}</p>
                    <p><strong>السعر:</strong> <span className="font-bold text-primary">{requestData.price} جنيه</span></p>
                </div>
            </div>
            
            <div className="flex justify-between items-center gap-4">
                 <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                    <ArrowLeft className="me-2 h-4 w-4" />
                    العودة للتعديل
                </Button>
                <Button onClick={handleConfirm} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      جارٍ التأكيد...
                    </>
                  ) : 'تأكيد الطلب والانتقال للدفع'}
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
