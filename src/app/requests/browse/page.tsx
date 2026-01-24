'use client';

import ar from '@/locales/ar';

export default function BrowseRequestsPage() {
  const t = ar.header.links;
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold font-headline mb-6">{t.browse_requests}</h1>
      <div className="border rounded-lg p-8 text-center bg-secondary/50">
        <p className="text-muted-foreground">سيتم عرض جميع طلبات الشرح المفتوحة هنا قريبًا.</p>
      </div>
    </div>
  );
}
