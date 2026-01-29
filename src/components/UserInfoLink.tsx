'use client';

import Link from 'next/link';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface UserInfoLinkProps {
  userId?: string;
  name?: string; // Accept name as an optional prop
  className?: string;
}

export function UserInfoLink({ userId, name, className }: UserInfoLinkProps) {
    const firestore = useFirestore();
    // Only fetch if the name is not provided
    const userProfileRef = useMemoFirebase(
        () => (userId && !name ? doc(firestore, 'userProfiles', userId) : null),
        [firestore, userId, name]
    );
    const { data: userProfile, isLoading } = useDoc<UserProfile>(userProfileRef);

    if (!userId) return <span className={cn("text-muted-foreground", className)}>-</span>;

    // If name is provided, render immediately
    if (name) {
        return (
            <Link href={`/users/${userId}`} className={cn("hover:underline font-medium text-primary", className)}>
                {name}
            </Link>
        );
    }
    
    if (isLoading) return <Skeleton className={cn("h-5 w-24", className)} />;

    return (
        <Link href={`/users/${userId}`} className={cn("hover:underline font-medium text-primary", className)}>
            {userProfile?.name || 'مستخدم غير معروف'}
        </Link>
    );
}
