'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ar from '@/locales/ar';
import { useFirestore } from '@/firebase';
import { collection, doc, getDoc, getDocs, query, where, runTransaction, increment, limit } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Search } from 'lucide-react';

const searchSchema = z.object({
  searchTerm: z.string().min(1, "الرجاء إدخال بريد إلكتروني أو ID"),
});

const addBalanceSchema = z.object({
  amount: z.coerce.number().min(1, "المبلغ يجب أن يكون أكبر من صفر"),
  description: z.string().min(5, "الوصف يجب أن يكون 5 أحرف على الأقل").max(100, "الوصف طويل جدًا"),
});

function getInitials(name?: string) {
    if (typeof name !== 'string' || !name) {
        return '?';
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
}

function AddBalanceForm({ user, onDone }: { user: UserProfile, onDone: () => void }) {
    const t = ar.admin.add_balance;
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const form = useForm<z.infer<typeof addBalanceSchema>>({
        resolver: zodResolver(addBalanceSchema),
        defaultValues: { amount: 50, description: '' },
    });

    const onSubmit = async (values: z.infer<typeof addBalanceSchema>) => {
        try {
            await runTransaction(firestore, async (transaction) => {
                const userProfileRef = doc(firestore, 'userProfiles', user.id);
                transaction.update(userProfileRef, { balance: increment(values.amount) });

                const transactionCol = collection(firestore, 'transactions');
                const newTransactionRef = doc(transactionCol);
                transaction.set(newTransactionRef, {
                    userId: user.id,
                    type: 'deposit',
                    amount: values.amount,
                    description: values.description,
                    createdAt: new Date().toISOString()
                });
            });

            addDocumentNonBlocking(collection(firestore, 'notifications'), {
                userId: user.id,
                title: 'تمت إضافة رصيد إلى محفظتك',
                message: `أضاف المسؤول مبلغ ${values.amount} جنيه إلى رصيدك. السبب: ${values.description}`,
                link: '/wallet',
                isRead: false,
                createdAt: new Date().toISOString()
            });

            toast({ title: t.success_toast_title, description: t.success_toast_description.replace('{amount}', values.amount.toString()).replace('{name}', user.name) });
            onDone();

        } catch (e: any) {
            console.error("Add balance failed:", e);
            toast({ variant: 'destructive', title: t.error_toast_title, description: e.message });
        }
    };

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>{t.add_balance_to.replace('{name}', user.name)}</CardTitle>
            </CardHeader>
            <CardContent>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.amount_label}</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="100" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.description_label}</FormLabel>
                                <FormControl>
                                <Input placeholder={t.description_placeholder} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={onDone}>إلغاء</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                {t.submit_button}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export default function AddBalanceAdminPage() {
    const t = ar.admin.add_balance;
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
                                    <FormLabel className="sr-only">{t.search_label}</FormLabel>
                                    <FormControl>
                                    <Input placeholder={t.search_placeholder} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isSearching}>
                                {isSearching ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Search className="me-2 h-4 w-4"/>}
                                {isSearching ? t.searching_button : t.search_button}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {noUserFound && (
                <Alert variant="destructive" className="mt-6">
                    <AlertTitle>خطأ</AlertTitle>
                    <AlertDescription>{t.user_not_found}</AlertDescription>
                </Alert>
            )}

            {foundUser && (
                <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-2">{t.user_details}</h2>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={foundUser.photoURL} alt={foundUser.name || ''} />
                                    <AvatarFallback>{getInitials(foundUser.name)}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <p className="text-xl font-bold">{foundUser.name}</p>
                                    <p className="text-sm text-muted-foreground">{foundUser.email}</p>
                                    <p className="text-sm">
                                        <span className="text-muted-foreground">{t.current_balance}: </span>
                                        <span className="font-mono font-semibold text-primary">{(foundUser.balance ?? 0).toFixed(2)} جنيه</span>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <AddBalanceForm user={foundUser} onDone={() => {
                        setFoundUser(null);
                        searchForm.reset();
                    }} />
                </div>
            )}
        </div>
    );
}
