"use client";

import {
  useCollection,
  useFirestore,
  useMemoFirebase,
} from "@/firebase";
import { collection, doc } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import ar from "@/locales/ar";


function UserTable() {
  const t = ar.admin;
  const firestore = useFirestore();
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(
    () => collection(firestore, "userProfiles"),
    [firestore]
  );
  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  }

  const handleVerification = async (user: UserProfile, verify: boolean) => {
    const userDocRef = doc(firestore, 'userProfiles', user.id);
    try {
      setDocumentNonBlocking(userDocRef, { isVerified: verify }, { merge: true });
      toast({
        title: verify ? t.toasts.verify_success : t.toasts.unverify_success,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.toasts.update_error,
      });
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t.user_table.name}</TableHead>
          <TableHead>{t.user_table.email}</TableHead>
          <TableHead>{t.user_table.user_type}</TableHead>
          <TableHead className="text-center">{t.user_table.verified}</TableHead>
          <TableHead className="text-right">{t.user_table.actions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users?.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.photoURL} />
                  <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant="secondary">{ar.user_types[user.userType]}</Badge>
            </TableCell>
            <TableCell className="text-center">
              {user.isVerified ? (
                <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mx-auto" />
              )}
            </TableCell>
            <TableCell className="text-right">
              {user.isVerified ? (
                <Button variant="destructive" size="sm" onClick={() => handleVerification(user, false)}>
                  {t.user_table.unverify_button}
                </Button>
              ) : (
                <Button size="sm" onClick={() => handleVerification(user, true)}>
                  {t.user_table.verify_button}
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}


export default function AdminDashboardPage() {
  const t = ar.admin;
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-2 font-headline">{t.dashboard_title}</h1>
      <p className="text-muted-foreground mb-8">
        {t.dashboard_description}
      </p>

      <Card>
        <CardHeader>
          <CardTitle>{t.users_title}</CardTitle>
          <CardDescription>{t.users_description}</CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable />
        </CardContent>
      </Card>
    </div>
  );
}
