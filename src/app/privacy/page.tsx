import { ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  const points = [
    "نحن نجمع البيانات اللازمة فقط لتقديم خدماتنا.",
    "لا نشارك بياناتك الشخصية مع أطراف ثالثة دون موافقتك.",
    "يتم تسجيل الجلسات لأغراض الجودة والأمان فقط.",
    "يمكنك طلب حذف بياناتك في أي وقت.",
    "نستخدم تقنيات تشفير آمنة لحماية معلوماتك.",
  ];

  return (
    <div className="bg-background">
      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-headline font-bold text-center text-primary mb-4">
            سياسة الخصوصية
          </h1>
          <p className="text-center text-muted-foreground mb-12">
            خصوصيتك هي أولويتنا القصوى.
          </p>
          <div className="space-y-6">
            {points.map((point, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg bg-secondary/50">
                <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-foreground">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
