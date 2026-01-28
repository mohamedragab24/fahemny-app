'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, doc, query, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import ar from '@/locales/ar';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';


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
  const USERS_PER_PAGE = 20;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchUsers = async (loadMore = false) => {
    if (loadMore && !hasMore) return;
    
    try {
      if (loadMore) setIsLoadingMore(true);
      else setIsLoading(true);

      let q = query(
        collection(firestore, 'userProfiles'),
        orderBy('createdAt', 'desc'),
        limit(USERS_PER_PAGE)
      );

      if (loadMore && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const documentSnapshots = await getDocs(q);
      const newUsers = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
      
      setUsers(prev => loadMore ? [...prev, ...newUsers] : newUsers);
      
      const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(lastDoc);

      if (documentSnapshots.docs.length < USERS_PER_PAGE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ variant: 'destructive', title: 'فشل تحميل المستخدمين' });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchUsers(false);
  }, [firestore]);

  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        const searchMatch = searchTerm === '' ||
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const roleMatch = roleFilter === 'all' || user.role === roleFilter || (roleFilter === 'none' && !user.role);
        
        return searchMatch && roleMatch;
      });
  }, [users, searchTerm, roleFilter]);


  const handleToggleUserStatus = (userId: string, isDisabled: boolean, userName: string) => {
    const userRef = doc(firestore, 'userProfiles', userId);
    updateDocumentNonBlocking(userRef, { disabled: isDisabled });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, disabled: isDisabled } : u));
    toast({
        title: `تم ${isDisabled ? 'حظر' : 'تفعيل'} المستخدم`,
        description: `تم تحديث حالة المستخدم ${userName}.`,
    });
  };
  
  const handleToggleAdminStatus = (userId: string, isAdmin: boolean, userName: string) => {
    const userRef = doc(firestore, 'userProfiles', userId);
    updateDocumentNonBlocking(userRef, { isAdmin: isAdmin });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isAdmin } : u));
    toast({
        title: `تم تحديث صلاحيات المسؤول`,
        description: `تم ${isAdmin ? 'منح' : 'إزالة'} صلاحيات المسؤول للمستخدم ${userName}.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t.title}</CardTitle>
        <CardDescription>{t.users_list}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <Input 
            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="تصفية بالدور" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الأدوار</SelectItem>
              <SelectItem value="student">مستفهم</SelectItem>
              <SelectItem value="tutor">مفهّم</SelectItem>
              <SelectItem value="none">لم يحدد</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
            <div className="space-y-2">
                {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.table.name}</TableHead>
                <TableHead>{t.table.role}</TableHead>
                <TableHead>الرصيد</TableHead>
                <TableHead>{t.table.joined_at}</TableHead>
                <TableHead>{t.table.is_admin}</TableHead>
                <TableHead className="text-center">{t.table.is_disabled}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Link href={`/users/${user.id}`} className="group/userlink">
                      <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                              <AvatarImage src={user.photoURL} alt={user.name || ''} />
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                              <span className="font-medium group-hover/userlink:underline">{user.name}</span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    {user.role ? (
                      <Badge variant="secondary">{user.role === 'student' ? 'مستفهم' : 'مفهّم'}</Badge>
                    ) : (
                      <span className="text-muted-foreground">لم يحدد</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono">{(user.balance ?? 0).toFixed(2)}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString('ar-EG')}</TableCell>
                   <TableCell>
                     <Switch
                        checked={!!user.isAdmin}
                        onCheckedChange={(isAdmin) => handleToggleAdminStatus(user.id, isAdmin, user.name)}
                        aria-label="Toggle Admin"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                        checked={!!user.disabled}
                        onCheckedChange={(isDisabled) => handleToggleUserStatus(user.id, isDisabled, user.name)}
                        aria-label="Toggle Disabled"
                    />
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">لا يوجد مستخدمون يطابقون معايير البحث.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {hasMore && (
        <CardFooter className="justify-center border-t pt-6">
            <Button onClick={() => fetchUsers(true)} disabled={isLoadingMore}>
                {isLoadingMore ? <Loader2 className="me-2 h-4 w-4 animate-spin"/> : null}
                تحميل المزيد
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}
