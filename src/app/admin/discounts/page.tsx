'use client';

import { useState } from 'react';
import ar from '@/locales/ar';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc, getDoc } from 'firebase/firestore';
import type { DiscountCode } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Loader2, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const discountFormSchema = z.object({
  code: z.string().min(3, "الكود يجب أن يكون 3 أحرف على الأقل").transform(val => val.toUpperCase()),
  type: z.enum(['fixed', 'percentage'], { required_error: 'الرجاء اختيار نوع الخصم' }),
  value: z.coerce.number().min(1, 'القيمة يجب أن تكون 1 على الأقل'),
  usageLimit: z.coerce.number().min(1, 'الحد الأدنى للاستخدام هو 1'),
});

function AddDiscountDialog() {
    const t = ar.admin.discounts.form;
    const [open, setOpen] = useState(false);
    const firestore = useFirestore();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof discountFormSchema>>({
        resolver: zodResolver(discountFormSchema),
        defaultValues: {
            code: '',
            type: 'fixed',
            value: 50,
            usageLimit: 100
        },
    });

    const onSubmit = async (values: z.infer<typeof discountFormSchema>) => {
        
        // Check if code already exists
        const codeRef = doc(firestore, 'discountCodes', values.code);
        const codeSnap = await getDoc(codeRef);
        if (codeSnap.exists()) {
            form.setError('code', { type: 'manual', message: t.code_exists });
            return;
        }
        
        try {
            const newCode: Omit<DiscountCode, 'id'> = {
                ...values,
                usageCount: 0,
                isActive: true,
                createdAt: new Date().toISOString(),
            };
            await addDocumentNonBlocking(collection(firestore, 'discountCodes'), newCode, values.code); // Using code as ID
            
            toast({ title: 'تمت الإضافة بنجاح', description: `تم إنشاء كود الخصم ${values.code}.` });
            setOpen(false);
            form.reset();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'فشلت الإضافة', description: error.message });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="me-2 h-4 w-4" />{ar.admin.discounts.add_button}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t.add_title}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField control={form.control} name="code" render={({ field }) => (
                            <FormItem><FormLabel>{t.code_label}</FormLabel><FormControl><Input placeholder={t.code_placeholder} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="type" render={({ field }) => (
                            <FormItem><FormLabel>{t.type_label}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="fixed">{t.type_fixed}</SelectItem>
                                        <SelectItem value="percentage">{t.type_percentage}</SelectItem>
                                    </SelectContent>
                                </Select><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="value" render={({ field }) => (
                            <FormItem><FormLabel>{t.value_label}</FormLabel><FormControl><Input type="number" placeholder={form.getValues('type') === 'fixed' ? t.value_placeholder_fixed : t.value_placeholder_percentage} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="usageLimit" render={({ field }) => (
                             <FormItem><FormLabel>{t.usageLimit_label}</FormLabel><FormControl><Input type="number" placeholder={t.usageLimit_placeholder} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t.cancel}</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                {t.submit}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminDiscountsPage() {
  const t = ar.admin.discounts;
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const codesQuery = useMemoFirebase(() => query(collection(firestore, 'discountCodes'), orderBy('createdAt', 'desc')), [firestore]);
  const { data: codes, isLoading } = useCollection<DiscountCode>(codesQuery);

  const handleToggleStatus = (code: DiscountCode, isActive: boolean) => {
    const codeRef = doc(firestore, 'discountCodes', code.id);
    updateDocumentNonBlocking(codeRef, { isActive });
    toast({
        title: `تم تحديث الحالة`,
        description: `تم ${isActive ? 'تفعيل' : 'إلغاء تفعيل'} الكود ${code.code}.`,
    });
  };

  const handleDeleteCode = async (codeId: string) => {
    try {
        await deleteDoc(doc(firestore, 'discountCodes', codeId));
        toast({ title: 'تم الحذف بنجاح' });
        // The real-time listener will update the UI automatically.
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'فشل الحذف', description: error.message });
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
            <CardTitle className="font-headline">{t.title}</CardTitle>
            <CardDescription>{t.description}</CardDescription>
        </div>
        <AddDiscountDialog />
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
                <TableHead>{t.table.code}</TableHead>
                <TableHead>{t.table.type}</TableHead>
                <TableHead>{t.table.value}</TableHead>
                <TableHead>{t.table.usage}</TableHead>
                <TableHead>{t.table.status}</TableHead>
                <TableHead className="text-center">{t.table.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes && codes.length > 0 ? codes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell className="font-mono font-semibold">{code.code}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{code.type === 'fixed' ? 'مبلغ ثابت' : 'نسبة مئوية'}</Badge>
                  </TableCell>
                  <TableCell>
                    {code.type === 'percentage' ? `${code.value}%` : `${code.value} جنيه`}
                  </TableCell>
                  <TableCell>{code.usageCount} / {code.usageLimit}</TableCell>
                  <TableCell>
                     <Switch
                        checked={code.isActive}
                        onCheckedChange={(isActive) => handleToggleStatus(code, isActive)}
                        aria-label="Toggle Status"
                    />
                    <span className="ms-2 text-xs text-muted-foreground">{code.isActive ? t.active : t.inactive}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                <AlertDialogDescription>{t.confirm_delete}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCode(code.id)} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">{t.no_codes}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
