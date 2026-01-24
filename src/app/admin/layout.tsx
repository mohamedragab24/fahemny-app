"use client";

import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import ar from "@/locales/ar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = ar.admin;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'userProfiles', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="container mx-auto py-10">
        <Skeleton className="h-screen w-full" />
      </div>
    );
  }

  if (!userProfile?.isAdmin) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                    <ShieldAlert className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="mt-4">{t.layout_title}</CardTitle>
                <CardDescription>{t.layout_description}</CardDescription>
            </CardHeader>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
