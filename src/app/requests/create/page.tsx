'use client';

import ar from '@/locales/ar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CreateRequestPage() {
  const t = ar.header.links;
  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">{t.create_request}</CardTitle>
          <CardDescription>املأ النموذج التالي لنشر طلبك وسيتم عرضه للمفهّمين.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان الطلب</Label>
              <Input id="title" placeholder="مثال: أحتاج مساعدة في معادلات الدرجة الثانية" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field">المجال</Label>
               <Input id="field" placeholder="مثال: الرياضيات، البرمجة، التصميم" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">التفاصيل</Label>
              <Textarea id="description" placeholder="اشرح بالتفصيل ما الذي تحتاج إلى فهمه..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">السعر (بالجنيه المصري)</Label>
                <Input id="price" type="number" placeholder="50" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="tutor-gender">جنس المفهّم المطلوب</Label>
                <Select>
                  <SelectTrigger id="tutor-gender">
                    <SelectValue placeholder="اختر..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">الكل</SelectItem>
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="session-date">تاريخ الجلسة</Label>
                    <Input id="session-date" type="date" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="session-time">وقت الجلسة</Label>
                    <Input id="session-time" type="time" />
                </div>
            </div>
            <Button type="submit" className="w-full">نشر الطلب</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
