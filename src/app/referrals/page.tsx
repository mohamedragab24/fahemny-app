'use client';

import { useState } from 'react';
import ar from '@/locales/ar';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ReferralsPage() {
  const t = ar.referrals;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'userProfiles', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading) {
    return (
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-12 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    router.replace('/login');
    return null;
  }
  
  if (!userProfile) {
    return null; // Should be handled by loading state or redirect
  }

  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/register?ref=${userProfile.referralCode}`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <div className="space-y-2">
            <label htmlFor="referral-link" className="text-sm font-medium">{t.your_link}</label>
            <div className="flex gap-2">
              <Input id="referral-link" value={referralLink} readOnly />
              <Button onClick={handleCopy} variant="outline" size="icon">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">{copied ? t.copied : t.copy_link}</span>
              </Button>
            </div>
            {copied && <p className="text-sm text-green-600">{t.copied}</p>}
          </div>

          <div className="p-6 rounded-lg bg-secondary text-center">
             <h3 className="text-sm font-semibold text-secondary-foreground">{t.referral_count_title}</h3>
             <p className="text-4xl font-bold text-primary mt-2">{userProfile.referralCount || 0}</p>
             <p className="text-muted-foreground">{t.users}</p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
