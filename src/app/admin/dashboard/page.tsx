'use client';

import { Construction } from 'lucide-react';

// This page has been temporarily disabled to resolve a critical Firestore
// permission error affecting the entire application. The security rules
// required to make user-facing queries work are incompatible with
// admin-level queries that list all users.

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <Construction className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold font-headline">الصفحة معطلة مؤقتاً</h2>
        <p className="max-w-md mt-2 text-muted-foreground">
            تم تعطيل هذه الصفحة كجزء من إصلاح شامل لأخطاء الصلاحيات في التطبيق.
        </p>
    </div>
  );
}
