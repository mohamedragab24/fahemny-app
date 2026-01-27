'use client';

import ar from '@/locales/ar';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { collection, query, doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function AdminUsersPage() {
  const t = ar.admin.users;
  const firestore = useFirestore();
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'userProfiles')) : null),
    [firestore]
  );
  
  const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);

  const handleAdminToggle = (user: UserProfile) => {
    const userRef = doc(firestore, 'userProfiles', user.id);
    const newIsAdmin = !user.isAdmin;
    updateDocumentNonBlocking(userRef, { isAdmin: newIsAdmin });
    toast({
      title: 'تم تحديث الصلاحيات',
      description: `تم ${newIsAdmin ? 'منح' : 'إزالة'} صلاحيات المسؤول للمستخدم ${user.name}.`,
    });
  };
  
  const roleTranslations = {
      student: 'مستفهم',
      tutor: 'مفهّم'
  }

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">{t.title}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t.users_list}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.table.name}</TableHead>
                <TableHead>{t.table.email}</TableHead>
                <TableHead>{t.table.role}</TableHead>
                <TableHead>{t.table.joined_at}</TableHead>
                <TableHead className="text-center">{t.table.is_admin}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingUsers ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.role ? (
                        <Badge variant="secondary">{roleTranslations[user.role as keyof typeof roleTranslations] || user.role}</Badge>
                      ) : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString('ar-EG')}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={user.isAdmin || false}
                        onCheckedChange={() => handleAdminToggle(user)}
                        aria-label="Toggle admin status"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">{t.no_users}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
