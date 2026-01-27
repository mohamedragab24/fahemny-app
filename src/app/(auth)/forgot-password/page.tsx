"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
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
import { Loader2, ArrowLeft } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
});

export default function ForgotPasswordPage() {
  const t = ar.forgot_password;
  const auth = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    try {
      await sendPasswordResetEmail(auth, values.email);
      toast({
        title: t.success_title,
        description: t.success_description,
      });
      form.reset();
    } catch (error: any) {
      console.error("Password reset failed:", error);
      toast({
        variant: "destructive",
        title: "حدث خطأ!",
        description: "فشل إرسال رابط إعادة التعيين. تأكد من صحة البريد الإلكتروني.",
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{ar.login.email_label}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={ar.login.email_placeholder}
                      {...field}
                    />
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
         <Link href="/login" className="flex items-center justify-center gap-1 text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            <span>{t.back_to_login}</span>
        </Link>
      </div>
    </Card>
  );
}
