"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc } from "firebase/firestore";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useI18n } from "@/locales/client";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  userType: z.enum(["freelancer", "employer"]),
});

export default function RegisterPage() {
  const t = useI18n();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      userType: "freelancer",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      const userProfile = {
        id: user.uid,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        userType: values.userType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const userDocRef = doc(firestore, "userProfiles", user.uid);
      setDocumentNonBlocking(userDocRef, userProfile, { merge: true });

      toast({
        title: "Account Created!",
        description: "You have been successfully registered.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message || "Could not create your account.",
      });
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-headline">{t('register.title')}</CardTitle>
        <CardDescription>
          {t('register.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('register.first_name_label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('register.first_name_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('register.last_name_label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('register.last_name_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('register.email_label')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('register.email_placeholder')}
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
                  <FormLabel>{t('register.password_label')}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>{t('register.user_type_label')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="freelancer" id="r-freelancer" />
                        </FormControl>
                        <FormLabel htmlFor="r-freelancer" className="font-normal">
                          {t('register.user_type_freelancer')}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                         <FormControl>
                          <RadioGroupItem value="employer" id="r-employer" />
                        </FormControl>
                        <FormLabel htmlFor="r-employer" className="font-normal">
                          {t('register.user_type_employer')}
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? t('register.submitting_button') : t('register.submit_button')}
            </Button>
          </form>
        </Form>
      </CardContent>
      <div className="mt-4 text-center text-sm p-6 pt-0">
        {t('register.login_link_text')}{" "}
        <Link href="/login" className="underline">
          {t('register.login_link')}
        </Link>
      </div>
    </Card>
  );
}
