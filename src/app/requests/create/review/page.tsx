'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, getDoc, runTransaction, increment } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import ar from '@/locales/ar';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ArrowLeft, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { DiscountCode } from '@/lib/types';


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
  const t_review = ar.review_request;

  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplyingCode, setIsApplyingCode] = useState(false);
  const [discountInput, setDiscountInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  
  useEffect(() => {
    const savedData = sessionStorage.getItem('newRequestData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setRequestData(parsedData);
        setFinalPrice(parsedData.price);
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
  
  const handleApplyDiscount = async () => {
    if (!discountInput || !requestData) return;
    setIsApplyingCode(true);

    try {
        const codeRef = doc(firestore, 'discountCodes', discountInput.trim().toUpperCase());
        const codeSnap = await getDoc(codeRef);

        if (!codeSnap.exists() || !codeSnap.data().isActive || codeSnap.data().usageCount >= codeSnap.data().usageLimit) {
            toast({ variant: 'destructive', title: t_review.invalid_code_toast });
            setAppliedDiscount(null);
            setFinalPrice(requestData.price);
            return;
        }

        const codeData = { id: codeSnap.id, ...codeSnap.data() } as DiscountCode;
        let newPrice = requestData.price;
        if (codeData.type === 'percentage') {
            newPrice = requestData.price * (1 - codeData.value / 100);
        } else { // fixed
            newPrice = requestData.price - codeData.value;
        }

        setFinalPrice(Math.max(0, newPrice)); // Price can't be negative
        setAppliedDiscount(codeData);
        toast({ title: t_review.code_applied_toast });

    } catch (error) {
        console.error("Error applying discount code:", error);
        toast({ variant: 'destructive', title: 'خطأ', description: 'حدث خطأ أثناء تطبيق الكود.' });
    } finally {
        setIsApplyingCode(false);
    }
  };


  const handleConfirm = async () => {
    if (!user || !requestData || finalPrice === null) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'بيانات الطلب أو المستخدم غير موجودة.' });
        return;
    }
    
    setIsSubmitting(true);

    try {
        await runTransaction(firestore, async (transaction) => {
            const newRequestRef = doc(collection(firestore, 'sessionRequests'));

            // If a discount is applied, re-validate and update it within the transaction
            if (appliedDiscount) {
                const discountRef = doc(firestore, 'discountCodes', appliedDiscount.id);
                const discountSnap = await transaction.get(discountRef);
                if (!discountSnap.exists() || !discountSnap.data().isActive || discountSnap.data().usageCount >= discountSnap.data().usageLimit) {
                    // This error will abort the transaction
                    throw new Error(t_review.invalid_code_toast);
                }
                transaction.update(discountRef, { usageCount: increment(1) });
            }

            // Create the session request document
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 7); // Expires in 7 days

            const newRequest = {
                ...requestData,
                studentId: user.uid,
                status: 'open' as 'open',
                createdAt: new Date().toISOString(),
                expiresAt: expiryDate.toISOString(),
                price: finalPrice, // Use the final price
                ...(appliedDiscount && { 
                    originalPrice: requestData.price,
                    discountCode: appliedDiscount.code 
                })
            };
            transaction.set(newRequestRef, newRequest);
        });

        // If transaction succeeds:
        sessionStorage.removeItem('newRequestData');
        toast({
            title: 'تم تأكيد طلبك!',
            description: 'سيتم توجيهك الآن إلى صفحة الدفع (محاكاة).',
        });
        router.push('/payment');

    } catch (error: any) {
        console.error("Failed to create request:", error);
        toast({ variant: 'destructive', title: 'فشل نشر الطلب', description: error.message || 'حدث خطأ غير متوقع. قد يكون الكود المستخدم لم يعد صالحًا.' });
        setAppliedDiscount(null); // Reset discount on failure
        setFinalPrice(requestData.price);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!requestData || finalPrice === null) {
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

  const discountValue = appliedDiscount ? (requestData.price - finalPrice) : 0;

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
                </div>
            </div>

            {/* Discount Code Section */}
            <div className="space-y-3 rounded-lg border p-4">
                <label className="text-sm font-medium">{t_review.discount_code_label}</label>
                <div className="flex gap-2">
                    <Input 
                        placeholder="EID2024" 
                        value={discountInput}
                        onChange={(e) => setDiscountInput(e.target.value)}
                        disabled={isApplyingCode || !!appliedDiscount}
                    />
                    <Button onClick={handleApplyDiscount} disabled={isApplyingCode || !discountInput || !!appliedDiscount}>
                        {isApplyingCode && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                        {t_review.apply_button}
                    </Button>
                </div>
                {appliedDiscount && (
                     <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => {
                        setAppliedDiscount(null);
                        setFinalPrice(requestData.price);
                        setDiscountInput('');
                    }}>
                        إزالة الكود
                    </Button>
                )}
            </div>

             {/* Pricing Section */}
            <div className="space-y-2 rounded-lg border p-4 text-lg">
                <div className="flex justify-between items-center text-muted-foreground">
                    <span>السعر الأصلي:</span>
                    <span>{requestData.price.toFixed(2)} جنيه</span>
                </div>
                {appliedDiscount && (
                    <div className="flex justify-between items-center text-green-600">
                        <span>{t_review.discount_label}</span>
                        <span>- {discountValue.toFixed(2)} جنيه</span>
                    </div>
                )}
                <div className="border-t my-2"></div>
                <div className="flex justify-between items-center font-bold text-primary text-xl">
                    <span>{t_review.final_price_label}</span>
                    <span>{finalPrice.toFixed(2)} جنيه</span>
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
