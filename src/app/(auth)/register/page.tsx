"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, runTransaction, increment } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ar from "@/locales/ar";
import { Loader2 } from "lucide-react";
import type { UserProfile } from "@/lib/types";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const registerSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

function RegisterForm() {
  const t = ar.register;
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    const referralCode = searchParams.get('ref');

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      await runTransaction(firestore, async (transaction) => {
        const newUserProfileRef = doc(firestore, "userProfiles", user.uid);

        const newUserProfileData: Partial<UserProfile> = {
          id: user.uid,
          name: values.name,
          email: values.email,
          createdAt: new Date().toISOString(),
          disabled: false,
          isAdmin: false,
          balance: 0,
          referralCode: user.uid, // User's own ID is their referral code
          referralCount: 0,
        };

        if (referralCode) {
          const referrerRef = doc(firestore, "userProfiles", referralCode);
          const referrerSnap = await transaction.get(referrerRef);

          if (referrerSnap.exists()) {
            newUserProfileData.referredBy = referralCode;
            transaction.update(referrerRef, { referralCount: increment(1) });
          }
        }
        
        transaction.set(newUserProfileRef, newUserProfileData);
      });

      toast({
        title: "تم إنشاء الحساب!",
        description: "سيتم توجيهك لاختيار دورك.",
      });

      router.push('/select-role');

    } catch (error: any) {
      console.error("Registration failed:", error);
      let description = "لم نتمكن من إنشاء حسابك. الرجاء المحاولة مرة أخرى.";
      if (error.code === 'auth/email-already-in-use') {
          description = "هذا البريد الإلكتروني مستخدم بالفعل. هل تريد تسجيل الدخول بدلاً من ذلك؟";
      }
      toast({
        variant: "destructive",
        title: "فشل إنشاء الحساب",
        description: description,
      });
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-headline">{t.title}</CardTitle>
        <CardDescription>
          {t.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.name_label}</FormLabel>
                  <FormControl>
                    <Input placeholder={t.name_placeholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.email_label}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t.email_placeholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.password_label}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {form.formState.isSubmitting ? t.submitting_button : t.submit_button}
            </Button>
          </form>
        </Form>
      </CardContent>
      <div className="mt-4 text-center text-sm p-6 pt-0">
        {t.login_link_text}{" "}
        <Link href="/login" className="underline">
          {t.login_link}
        </Link>
      </div>
    </Card>
  );
}

function RegisterPageSkeleton() {
    return (
        <Card>
            <CardHeader className="space-y-1 text-center">
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-5 w-64 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                <Skeleton className="h-10 w-full" />
            </CardContent>
            <div className="mt-4 text-center text-sm p-6 pt-0">
                <Skeleton className="h-5 w-48 mx-auto" />
            </div>
        </Card>
    );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterPageSkeleton />}>
      <RegisterForm />
    </Suspense>
  )
}