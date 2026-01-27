'use client';

import Link from 'next/link';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface UserInfoLinkProps {
  userId?: string;
  className?: string;
}

export function UserInfoLink({ userId, className }: UserInfoLinkProps) {
    const firestore = useFirestore();
    const userProfileRef = useMemoFirebase(
        () => (userId ? doc(firestore, 'userProfiles', userId) : null),
        [firestore, userId]
    );
    const { data: userProfile, isLoading } = useDoc<UserProfile>(userProfileRef);

    if (!userId) return <span className={cn("text-muted-foreground", className)}>-</span>;
    if (isLoading) return <Skeleton className={cn("h-5 w-24", className)} />;

    return (
        <Link href={`/users/${userId}`} className={cn("hover:underline font-medium text-primary", className)}>
            {userProfile?.name || 'مستخدم غير معروف'}
        </Link>
    );
}
