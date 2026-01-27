'use client';

import { ReactNode } from 'react';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LayoutDashboard, ShieldAlert, Users, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import ar from '@/locales/ar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const t = ar.admin;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'userProfiles', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const navItems = [
    { href: '/admin/dashboard', label: t.nav.dashboard, icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/admin/users', label: t.nav.users, icon: <Users className="h-4 w-4" /> },
    { href: '/admin/transactions', label: t.nav.transactions, icon: <Receipt className="h-4 w-4" /> },
  ];

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.14))]">
        <aside className="w-64 border-e p-4"><Skeleton className="h-full w-full" /></aside>
        <main className="flex-1 p-8"><Skeleton className="h-full w-full" /></main>
      </div>
    );
  }

  if (!userProfile?.isAdmin) {
    return (
      <div className="container py-16">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{t.access_denied.title}</AlertTitle>
          <AlertDescription>
            {t.access_denied.description}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.14))]">
      <aside className="w-64 border-e bg-secondary/50 p-4">
        <h2 className="text-xl font-headline font-semibold mb-6 px-2">{t.title}</h2>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  pathname === item.href && 'bg-primary/10 text-primary'
                )}
              >
                {item.icon}
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
