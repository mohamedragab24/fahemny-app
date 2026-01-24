"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserProfile } from "@/lib/types";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import ar from "@/locales/ar";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(1, "الاسم الأول مطلوب"),
  lastName: z.string().min(1, "اسم العائلة مطلوب"),
});

interface ProfileSettingsProps {
  userProfile: UserProfile;
}

export default function ProfileSettings({ userProfile }: ProfileSettingsProps) {
  const t = ar.dashboard.profile_settings;
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
    },
  });

  const { formState: { isSubmitting, isDirty } } = form;

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    try {
      const userDocRef = doc(firestore, "userProfiles", userProfile.id);
      setDocumentNonBlocking(userDocRef, {
        firstName: values.firstName,
        lastName: values.lastName,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      toast({
        title: t.success_toast,
      });
      form.reset(values); // To reset dirty state
    } catch (error) {
      console.error("Profile update failed:", error);
      toast({
        variant: "destructive",
        title: t.error_toast,
      });
    }
  }
  
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.first_name_label}</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>{t.last_name_label}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? t.submitting_button : t.submit_button}
            </Button>
          </form>
        </Form>
        <Separator />
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t.picture_title}</h3>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userProfile.photoURL} />
              <AvatarFallback>{getInitials(userProfile.firstName, userProfile.lastName)}</AvatarFallback>
            </Avatar>
            <Button variant="outline">{t.change_picture_button}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
