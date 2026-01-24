"use client";

import { useForm, zodResolver } from "@mantine/form";
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

  const form = useForm({
    initialValues: {
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
    },
    validate: zodResolver(profileSchema),
  });

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    try {
      const userDocRef = doc(firestore, "userProfiles", userProfile.id);
      await setDocumentNonBlocking(userDocRef, {
        firstName: values.firstName,
        lastName: values.lastName,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      toast({
        title: t.success_toast,
      });
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
        <form onSubmit={form.onSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.first_name_label}</FormLabel>
                <FormControl>
                  <Input {...field} {...form.getInputProps("firstName")} />
                </FormControl>
                <FormMessage>{form.errors.firstName as React.ReactNode}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.last_name_label}</FormLabel>
                <FormControl>
                  <Input {...field} {...form.getInputProps("lastName")} />
                </FormControl>
                <FormMessage>{form.errors.lastName as React.ReactNode}</FormMessage>
              </FormItem>
            )}
          />
          <Button type="submit" disabled={!form.isDirty() || !form.isValid()}>
            {/* We don't have isSubmitting from this form hook, so we just disable if not dirty or invalid */}
            {t.submit_button}
          </Button>
        </form>
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
