'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import ar from '@/locales/ar';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function getInitials(name?: string) {
    if (typeof name !== 'string' || !name) {
        return '?';
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
}


export default function AdminUsersPage() {
  const t = ar.admin.users;
  const firestore = useFirestore();
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(() => collection(firestore, 'userProfiles'), [firestore]);
  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  const handleToggleUserStatus = (user: UserProfile, isDisabled: boolean) => {
    const userRef = doc(firestore, 'userProfiles', user.id);
    updateDocumentNonBlocking(userRef, { disabled: isDisabled });
    toast({
        title: `تم ${isDisabled ? 'حظر' : 'تفعيل'} المستخدم`,
        description: `تم تحديث حالة المستخدم ${user.name}.`,
    });
  };
  
  const handleToggleAdminStatus = (user: UserProfile, isAdmin: boolean) => {
    const userRef = doc(firestore, 'userProfiles', user.id);
    updateDocumentNonBlocking(userRef, { isAdmin: isAdmin });
    toast({
        title: `تم تحديث صلاحيات المسؤول`,
        description: `تم ${isAdmin ? 'منح' : 'إزالة'} صلاحيات المسؤول للمستخدم ${user.name}.`,
    });
  };

  const sortedUsers = users?.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t.title}</CardTitle>
        <CardDescription>{t.users_list}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.table.name}</TableHead>
                <TableHead>{t.table.role}</TableHead>
                <TableHead>{t.table.joined_at}</TableHead>
                <TableHead>{t.table.is_admin}</TableHead>
                <TableHead className="text-center">{t.table.is_disabled}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers && sortedUsers.length > 0 ? sortedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL} alt={user.name || ''} />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.role ? (
                      <Badge variant="secondary">{user.role === 'student' ? 'مستفهم' : 'مفهّم'}</Badge>
                    ) : (
                      <span className="text-muted-foreground">لم يحدد</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString('ar-EG')}</TableCell>
                   <TableCell>
                     <Switch
                        checked={!!user.isAdmin}
                        onCheckedChange={(isAdmin) => handleToggleAdminStatus(user, isAdmin)}
                        aria-label="Toggle Admin"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                        checked={!!user.disabled}
                        onCheckedChange={(isDisabled) => handleToggleUserStatus(user, isDisabled)}
                        aria-label="Toggle Disabled"
                    />
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center">{t.no_users}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
