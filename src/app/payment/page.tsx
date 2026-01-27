'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function PaymentPage() {
    const router = useRouter();

    return (
        <div className="container py-12 flex items-center justify-center min-h-[calc(100vh-theme(spacing.28))]">
            <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <div className="mx-auto bg-green-100 dark:bg-green-900/50 rounded-full h-16 w-16 flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="font-headline pt-4">تم تأكيد طلبك!</CardTitle>
                    <CardDescription>هذه الصفحة هي محاكاة لصفحة الدفع. في التطبيق الحقيقي، سيتم توجيهك إلى بوابة دفع آمنة هنا.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-6">لقد تم نشر طلبك ويمكن للمفهّمين الآن رؤيته وقبوله. يمكنك متابعة حالة طلبك من صفحة "جلساتي".</p>
                    <Button onClick={() => router.push('/sessions')} className="w-full">
                        الانتقال إلى جلساتي
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
