'use client';

import ar from '@/locales/ar';

export default function AdminDashboardPage() {
  const t = ar.header.links;
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold font-headline mb-6">{t.admin_dashboard}</h1>
       <div className="border rounded-lg p-8 text-center bg-secondary/50">
        <p className="text-muted-foreground">أهلاً بك في لوحة تحكم المسؤول. سيتم عرض أدوات الإدارة هنا.</p>
      </div>
    </div>
  );
}
