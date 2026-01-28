'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ar from '@/locales/ar';
import { useFirestore } from '@/firebase';
import { collection, doc, getDoc, getDocs, query, where, limit } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Search, Users } from 'lucide-react';

const searchSchema = z.object({
  searchTerm: z.string().min(1, "الرجاء إدخال بريد إلكتروني أو ID"),
});

function getInitials(name?: string) {
    if (typeof name !== 'string' || !name) {
        return '?';
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
}

export default function AdminReferralsPage() {
    const t = ar.admin.referrals;
    const firestore = useFirestore();
    const { toast } = useToast();
    const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [noUserFound, setNoUserFound] = useState(false);

    const searchForm = useForm<z.infer<typeof searchSchema>>({
        resolver: zodResolver(searchSchema),
        defaultValues: { searchTerm: '' },
    });

    const onSearchSubmit = async (values: z.infer<typeof searchSchema>) => {
        setIsSearching(true);
        setFoundUser(null);
        setNoUserFound(false);
        const { searchTerm } = values;

        try {
            // First, try to get by ID
            const docRef = doc(firestore, 'userProfiles', searchTerm);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setFoundUser({ id: docSnap.id, ...docSnap.data() } as UserProfile);
            } else {
                // If not found by ID, query by email
                const q = query(collection(firestore, 'userProfiles'), where('email', '==', searchTerm), limit(1));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    setFoundUser({ id: userDoc.id, ...userDoc.data() } as UserProfile);
                } else {
                    setNoUserFound(true);
                }
            }
        } catch (error: any) {
            console.error("User search failed:", error);
            toast({ variant: 'destructive', title: 'خطأ في البحث', description: error.message });
            setNoUserFound(true);
        } finally {
            setIsSearching(false);
        }
    };
    
    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{t.title}</CardTitle>
                    <CardDescription>{t.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...searchForm}>
                        <form onSubmit={searchForm.handleSubmit(onSearchSubmit)} className="flex items-start gap-2">
                             <FormField
                                control={searchForm.control}
                                name="searchTerm"
                                render={({ field }) => (
                                <FormItem className="flex-grow">
                                    <FormLabel className="sr-only">{t.search_placeholder}</FormLabel>
                                    <FormControl>
                                    <Input placeholder={t.search_placeholder} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isSearching}>
                                {isSearching ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Search className="me-2 h-4 w-4"/>}
                                {isSearching ? ar.admin.add_balance.searching_button : ar.admin.add_balance.search_button}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {noUserFound && (
                <Alert variant="destructive" className="mt-6">
                    <AlertTitle>خطأ</AlertTitle>
                    <AlertDescription>{ar.admin.add_balance.user_not_found}</AlertDescription>
                </Alert>
            )}

            {foundUser && (
                <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-2">{t.referral_info}</h2>
                    <Card>
                        <CardHeader className="flex-row items-center gap-4 space-y-0">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={foundUser.photoURL} alt={foundUser.name || ''} />
                                <AvatarFallback>{getInitials(foundUser.name)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <p className="text-xl font-bold">{foundUser.name}</p>
                                <p className="text-sm text-muted-foreground">{foundUser.email}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-6 rounded-lg bg-secondary text-center">
                                <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                                <h3 className="text-sm font-semibold text-secondary-foreground mt-2">{t.referral_count}</h3>
                                <p className="text-4xl font-bold text-primary mt-1">{foundUser.referralCount || 0}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t.referral_code}</label>
                                <Input value={foundUser.referralCode} readOnly />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
