"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import * as React from "react";
import ar from "@/locales/ar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { UserProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const createProjectSchema = z.object({
  title: z.string().min(1, "عنوان المشروع مطلوب"),
  description: z.string().min(10, "يجب أن يكون الوصف 10 أحرف على الأقل"),
  category: z.string().min(1, "الفئة مطلوبة"),
  budget: z.coerce.number().min(1, "الميزانية مطلوبة"),
  deadline: z.date({ required_error: "الموعد النهائي مطلوب" }),
  tags: z.string().optional(),
  imageUrl: z.string().url("الرجاء إدخال رابط صورة صالح").optional().or(z.literal('')),
});

export default function CreateProjectPage() {
  const t = ar.create_project;
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'userProfiles', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const form = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      budget: 0,
      tags: "",
      imageUrl: "",
    },
  });

  async function onSubmit(values: z.infer<typeof createProjectSchema>) {
    if (!user || !userProfile || userProfile.userType !== 'employer') return;

    const projectData = {
      employerId: user.uid,
      title: values.title,
      description: values.description,
      category: values.category,
      budget: values.budget,
      deadline: values.deadline.toISOString(),
      tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
      imageUrl: values.imageUrl,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const projectsCollection = collection(firestore, 'projects');
    await addDocumentNonBlocking(projectsCollection, projectData);

    toast({
      title: "تم نشر المشروع!",
      description: "مشروعك الآن مرئي للمستقلين.",
    });

    router.push('/dashboard');
  }

  if (isUserLoading || isProfileLoading) {
    return (
        <div className="container mx-auto py-10">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p>يجب عليك تسجيل الدخول لنشر مشروع.</p>
        <Button asChild className="mt-4">
          <Link href="/login">تسجيل الدخول</Link>
        </Button>
      </div>
    );
  }

  if (userProfile?.userType !== 'employer') {
    return (
        <div className="container mx-auto py-10 text-center">
            <p>يجب أن تكون صاحب عمل لنشر مشروع. حسابك من نوع مستقل.</p>
            <Button asChild className="mt-4">
                <Link href="/dashboard">العودة إلى لوحة التحكم</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.project_title_label}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.project_title_placeholder} {...field} />
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
                    <FormLabel>{t.project_description_label}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t.project_description_placeholder}
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.category_label}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.category_placeholder} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="web-dev">{t.categories.web_dev}</SelectItem>
                          <SelectItem value="mobile-dev">{t.categories.mobile_dev}</SelectItem>
                          <SelectItem value="design">{t.categories.design}</SelectItem>
                          <SelectItem value="writing">{t.categories.writing}</SelectItem>
                          <SelectItem value="devops">{t.categories.devops}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.budget_label}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={t.budget_placeholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t.deadline_label}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>{t.deadline_placeholder}</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{ar.create_project.image_url_label}</FormLabel>
                    <FormControl>
                      <Input placeholder={ar.create_project.image_url_placeholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.tags_label}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.tags_placeholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button size="lg" type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {form.formState.isSubmitting ? t.submitting_button : t.submit_button}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
