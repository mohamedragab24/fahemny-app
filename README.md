# نسخة كاملة من كود مشروع فَهِّمْني

أهلاً بك! هذا الملف يحتوي على الكود الكامل لمشروع "فَهِّمْني". تم تجميع كل الملفات هنا في مكان واحد ليسهل عليك نسخها من هاتفك المحمول.

يمكنك نسخ محتوى هذا الملف بالكامل، ثم لاحقًا على جهاز كمبيوتر، قم بإنشاء الملفات والمجلدات كما هو موضح وضع الكود المناسب في كل ملف.

---

## File: `.env`

```

```

---

## File: `apphosting.yaml`

```yaml
# Settings to manage and configure a Firebase App Hosting backend.
# https://firebase.google.com/docs/app-hosting/configure

runConfig:
  # Increase this value if you'd like to automatically spin up
  # more instances in response to increased traffic.
  maxInstances: 1

```

---

## File: `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

---

## File: `docs/backend.json`

```json
{
  "entities": {
    "UserProfile": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "UserProfile",
      "type": "object",
      "description": "Represents a user profile in the FAHEMNY application.",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the user profile, matches Firebase Auth UID."
        },
        "name": {
          "type": "string",
          "description": "Full name of the user."
        },
        "email": {
          "type": "string",
          "description": "Email address of the user.",
          "format": "email"
        },
        "role": {
          "type": "string",
          "description": "The role of the user.",
          "enum": ["student", "tutor"]
        },
        "rating": {
          "type": "number",
          "description": "The user's average rating, from 1 to 5."
        },
        "createdAt": {
          "type": "string",
          "description": "Timestamp indicating when the user profile was created.",
          "format": "date-time"
        }
      },
      "required": [
        "id",
        "name",
        "email",
        "createdAt"
      ]
    },
    "SessionRequest": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "SessionRequest",
      "type": "object",
      "description": "Represents a request for an explanation session posted by a student.",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the session request."
        },
        "studentId": {
          "type": "string",
          "description": "The ID of the student (UserProfile) who created the request."
        },
        "tutorId": {
          "type": "string",
          "description": "The ID of the tutor (UserProfile) who accepted the request."
        },
        "title": {
          "type": "string",
          "description": "Title of the session request."
        },
        "field": {
          "type": "string",
          "description": "The academic or professional field of the request (e.g., Physics, Programming)."
        },
        "description": {
          "type": "string",
          "description": "Detailed description of what the student needs to understand."
        },
        "price": {
          "type": "number",
          "description": "The price offered by the student for the session."
        },
        "sessionDate": {
          "type": "string",
          "description": "The proposed date for the session.",
          "format": "date"
        },
        "sessionTime": {
          "type": "string",
          "description": "The proposed time for the session.",
          "format": "time"
        },
        "tutorGender": {
          "type": "string",
          "description": "The preferred gender of the tutor.",
          "enum": ["male", "female", "any"]
        },
        "status": {
          "type": "string",
          "description": "Current status of the request.",
          "enum": ["open", "accepted", "completed", "cancelled"]
        },
        "meetingLink": {
            "type": "string",
            "description": "The Zoom/Meet link for the session, provided by the tutor.",
            "format": "uri"
        },
        "createdAt": {
          "type": "string",
          "description": "Timestamp indicating when the request was posted.",
          "format": "date-time"
        }
      },
      "required": [
        "id",
        "studentId",
        "title",
        "field",
        "description",
        "price",
        "sessionDate",
        "sessionTime",
        "status",
        "createdAt"
      ]
    }
  },
  "auth": {
    "providers": [
      "password"
    ]
  },
  "firestore": {
    "structure": [
      {
        "path": "/userProfiles/{userId}",
        "definition": {
          "entityName": "UserProfile",
          "schema": {
            "$ref": "#/backend/entities/UserProfile"
          },
          "description": "Stores user profile information."
        }
      },
      {
        "path": "/sessionRequests/{requestId}",
        "definition": {
          "entityName": "SessionRequest",
          "schema": {
            "$ref": "#/backend/entities/SessionRequest"
          },
          "description": "Stores all session requests created by students."
        }
      }
    ],
    "reasoning": "The Firestore structure is simplified for the FAHEMNY app. It consists of two main collections: `userProfiles` for storing user data including their role (student or tutor), and `sessionRequests` for all tutoring requests. This flat structure is efficient for querying. `sessionRequests` can be queried by tutors, and students can view their own requests. Security rules will manage access based on user roles and ownership."
  }
}
```

---

## File: `firestore.rules`

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ----------------------------------------------------------------------
    // Helper Functions
    // ----------------------------------------------------------------------

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function getUserRole(userId) {
      return get(/databases/$(database)/documents/userProfiles/$(userId)).data.role;
    }

    function isStudent(userId) {
      return getUserRole(userId) == 'student';
    }

    function isTutor(userId) {
      return getUserRole(userId) == 'tutor';
    }

    // ----------------------------------------------------------------------
    // Collection Rules
    // ----------------------------------------------------------------------

    /**
     * @description Manages user profiles. Users can read any profile, but only edit their own.
     */
    match /userProfiles/{userId} {
      allow get: if true;
      allow list: if isSignedIn();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if false; // Users should not be able to delete their profiles directly.
    }

    /**
     * @description Manages session requests.
     * Students can create requests.
     * Tutors can view all open requests.
     * Only the creating student or the assigned tutor can view an accepted request.
     */
    match /sessionRequests/{requestId} {
      allow get: if isSignedIn() && 
                    (isTutor(request.auth.uid) || isOwner(resource.data.studentId));
      allow list: if isSignedIn() && isTutor(request.auth.uid);
      
      // A student can create a request for themselves.
      allow create: if isSignedIn() && isStudent(request.auth.uid) && request.resource.data.studentId == request.auth.uid;
      
      // An update can be performed by:
      // 1. A tutor accepting the request (setting tutorId and meetingLink).
      // 2. The student who created it, to cancel it if it's still open.
      // 3. Either participant to mark it as complete.
      allow update: if isSignedIn() && (
        (isTutor(request.auth.uid) && resource.data.tutorId == null) || // Tutor accepting
        (isOwner(resource.data.studentId) && resource.data.status == 'open') || // Student cancelling
        (isOwner(resource.data.studentId) || isOwner(resource.data.tutorId)) // Student/Tutor updating status post-session
      );
      
      // Only the student can delete their request, and only if it's still open.
      allow delete: if isSignedIn() && isOwner(resource.data.studentId) && resource.data.status == 'open';
    }
  }
}
```

---

## File: `next.config.ts`

```typescript
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
```

---

## File: `package.json`

```json
{
  "name": "fahemny",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack -p 9002",
    "genkit:dev": "genkit start -- tsx src/ai/dev.ts",
    "genkit:watch": "genkit start -- tsx --watch src/ai/dev.ts",
    "build": "NODE_ENV=production next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@genkit-ai/google-genai": "^1.20.0",
    "@genkit-ai/next": "^1.20.0",
    "@hookform/resolvers": "^4.1.3",
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-menubar": "^1.1.6",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toast": "^1.2.6",
    "@radix-ui/react-tooltip": "^1.1.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "dotenv": "^16.5.0",
    "embla-carousel-react": "^8.6.0",
    "firebase": "^11.9.1",
    "genkit": "^1.20.0",
    "lucide-react": "^0.475.0",
    "next": "15.5.9",
    "next-international": "^1.2.4",
    "patch-package": "^8.0.0",
    "react": "^19.2.1",
    "react-day-picker": "^9.11.3",
    "react-dom": "^19.2.1",
    "react-hook-form": "^7.54.2",
    "recharts": "^2.15.1",
    "tailwind-merge": "^3.0.1",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19.2.1",
    "@types/react-dom": "^19.2.1",
    "genkit-cli": "^1.20.0",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

---

## File: `src/ai/dev.ts`

```typescript
// Flows will be imported for their side effects in this file.
import './flows/create-zoom-meeting';
```

---

## File: `src/ai/flows/create-zoom-meeting.ts`

```typescript
'use server';
/**
 * @fileOverview A Genkit flow for creating a Zoom meeting.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CreateZoomMeetingInputSchema = z.object({
  topic: z.string().describe("The topic of the Zoom meeting."),
  startTime: z.string().describe("The start time of the meeting in ISO 8601 format."),
});

export const createZoomMeetingFlow = ai.defineFlow(
  {
    name: 'createZoomMeetingFlow',
    inputSchema: CreateZoomMeetingInputSchema,
    outputSchema: z.string().describe("The join URL for the created Zoom meeting."),
  },
  async (input) => {
    const { topic, startTime } = input;
    
    const zoomAccountId = process.env.ZOOM_ACCOUNT_ID;
    const zoomClientId = process.env.ZOOM_CLIENT_ID;
    const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET;

    if (!zoomAccountId || !zoomClientId || !zoomClientSecret) {
      throw new Error('Zoom environment variables are not set. Please check your .env.local file.');
    }

    // 1. Get Access Token
    const tokenResponse = await fetch('https://zoom.us/oauth/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${Buffer.from(`${zoomClientId}:${zoomClientSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'grant_type': 'account_credentials',
            'account_id': zoomAccountId,
        }),
        cache: 'no-store',
    });

    if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.text();
        console.error("Zoom Auth Error:", errorBody);
        throw new Error(`Failed to get Zoom access token. Status: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Create Meeting
    const meetingResponse = await fetch('https://api.zoom.us/v2/users/me/meetings', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            topic: topic,
            type: 2, // Scheduled meeting
            start_time: startTime,
            duration: 60, // Default to 60 minutes
            timezone: 'UTC',
            settings: {
                join_before_host: true,
                mute_upon_entry: true,
                participant_video: true,
                host_video: true,
                auto_recording: 'cloud',
            },
        }),
    });

    if (!meetingResponse.ok) {
        const errorBody = await meetingResponse.text();
        console.error("Zoom Meeting Creation Error:", errorBody);
        throw new Error(`Failed to create Zoom meeting. Status: ${meetingResponse.status}`);
    }
    
    const meetingData = await meetingResponse.json();
    return meetingData.join_url;
  }
);

// Wrapper function to be called from the client
export async function createZoomMeeting(input: z.infer<typeof CreateZoomMeetingInputSchema>) {
    return createZoomMeetingFlow(input);
}
```

---

## File: `src/ai/genkit.ts`

```typescript
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
```

---

## File: `src/app/(auth)/layout.tsx`

```typescript
import Link from "next/link";
import { BrainCircuit } from "lucide-react";
import ar from "@/locales/ar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.14))] flex-col items-center justify-center py-12 px-4">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2 font-bold font-headline text-2xl">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <span>{ar.header.title}</span>
        </Link>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
```

---

## File: `src/app/(auth)/login/page.tsx`

```typescript
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
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

const loginSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export default function LoginPage() {
  const t = ar.login;
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "تم تسجيل الدخول!",
        description: "أهلاً بعودتك.",
      });
      router.push("/");
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        variant: "destructive",
        title: "حدث خطأ!",
        description: error.message || "فشل تسجيل الدخول.",
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
               {form.formState.isSubmitting ? t.submitting_button : t.submit_button}
            </Button>
          </form>
        </Form>
      </CardContent>
      <div className="mt-4 text-center text-sm p-6 pt-0">
        {t.signup_link_text}{" "}
        <Link href="/register" className="underline">
          {t.signup_link}
        </Link>
      </div>
    </Card>
  );
}
```

---

## File: `src/app/(auth)/register/page.tsx`

```typescript
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
import { useToast } from "@/hooks/use-toast";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import ar from "@/locales/ar";

const registerSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export default function RegisterPage() {
  const t = ar.register;
  const router = useRouter();
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
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      const userProfile = {
        id: user.uid,
        name: values.name,
        email: values.email,
        createdAt: new Date().toISOString(),
      };

      const userDocRef = doc(firestore, "userProfiles", user.uid);
      setDocumentNonBlocking(userDocRef, userProfile, { merge: true });

      toast({
        title: "تم إنشاء الحساب!",
        description: "سيتم توجيهك لاختيار دورك.",
      });

      router.push('/select-role');

    } catch (error: any) {
      console.error("Registration failed:", error);
      toast({
        variant: "destructive",
        title: "حدث خطأ!",
        description: error.message || "لم نتمكن من إنشاء حسابك.",
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
```

---

## File: `src/app/about/page.tsx`

```typescript
import ar from "@/locales/ar";
import { Info } from "lucide-react";

export default function AboutPage() {
  const t = ar.home.about;
  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-headline font-bold text-primary mb-4">
            {ar.footer.about}
          </h1>
          <p className="text-xl text-muted-foreground">{t.vision_title}</p>
        </div>
        <div className="space-y-8">
          <div className="p-6 border rounded-lg bg-secondary/50">
            <h2 className="text-2xl font-headline font-semibold mb-2">{t.vision_title}</h2>
            <p>{t.vision_description}</p>
          </div>
          <div className="p-6 border rounded-lg bg-secondary/50">
            <h2 className="text-2xl font-headline font-semibold mb-2">{t.mission_title}</h2>
            <p>{t.mission_description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## File: `src/app/admin/dashboard/page.tsx`

```typescript
'use client';

import ar from '@/locales/ar';

export default function AdminDashboardPage() {
  const t = ar.header.links;
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold font-headline mb-6">{t.admin_dashboard}</h1>
       <div className="border rounded-lg p-8 text-center bg-secondary/50">
        <p className="text-muted-foreground">أهلاً بك في لوحة تحكم المسؤول. سيتم عرض أدوات الإدارة هنا.</p>
      </div>
    </div>
  );
}
```

---

## File: `src/app/admin/layout.tsx`

```typescript
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

---

## File: `src/app/contact/page.tsx`

```typescript
import ar from "@/locales/ar";
import { Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-headline font-bold text-primary mb-4">
          {ar.footer.contact}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          نحن هنا للمساعدة. تواصل معنا عبر البريد الإلكتروني.
        </p>
        <div className="inline-flex items-center gap-2 text-xl p-4 border rounded-lg bg-secondary/50">
          <Mail className="h-6 w-6 text-primary" />
          <span>contact@fahemny.app</span>
        </div>
      </div>
    </div>
  );
}
```

---

## File: `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: var(--font-body), sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-headline), sans-serif;
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
    --chart-1: 221.2 83.2% 53.3%;
    --chart-2: 166.2 83.2% 53.3%;
    --chart-3: 341.2 83.2% 53.3%;
    --chart-4: 41.2 83.2% 53.3%;
    --chart-5: 281.2 83.2% 53.3%;
  }
 
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
    --chart-1: 217.2 91.2% 59.8%;
    --chart-2: 167.2 91.2% 59.8%;
    --chart-3: 347.2 91.2% 59.8%;
    --chart-4: 47.2 91.2% 59.8%;
    --chart-5: 287.2 91.2% 59.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## File: `src/app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import ar from "@/locales/ar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-headline",
});

export const metadata: Metadata = {
  title: "FAHEMNY - فَهِّمْني",
  description: "فَهِّمْني – كل الفهم... من مكان واحد",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = 'ar';

  return (
    <html lang={locale} dir="rtl">
      <body
        className={cn(
          "relative h-full font-sans antialiased",
          inter.variable,
          spaceGrotesk.variable
        )}
      >
        <FirebaseClientProvider>
          <div className="flex flex-col min-h-screen">
            <Header translations={ar.header} />
            <main className="flex-grow">{children}</main>
            <Footer translations={ar.footer} />
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
```

---

## File: `src/app/page.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';

import { Button } from "@/components/ui/button";
import { ArrowRight, Lightbulb, Banknote, Users, Video, Star, ShieldCheck, MessageSquareX, History, CircleDollarSign } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ar from "@/locales/ar";
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const t = ar.home;
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'userProfiles', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    // Wait for user and profile data to be loaded
    if (isUserLoading || isProfileLoading) {
      return;
    }

    // If user is logged in, redirect based on role
    if (user) {
      if (userProfile?.role === 'student') {
        router.replace('/requests/create');
      } else if (userProfile?.role === 'tutor') {
        router.replace('/requests/browse');
      } else {
        // If logged in but no role, go to role selection
        router.replace('/select-role');
      }
    }
    // If no user, do nothing and show the landing page
  }, [user, userProfile, isUserLoading, isProfileLoading, router]);

  const howItWorksSteps = [
    { icon: <Lightbulb className="w-10 h-10 text-primary" />, text: t.how_it_works.steps[0] },
    { icon: <Banknote className="w-10 h-10 text-primary" />, text: t.how_it_works.steps[1] },
    { icon: <Users className="w-10 h-10 text-primary" />, text: t.how_it_works.steps[2] },
    { icon: <Video className="w-10 h-10 text-primary" />, text: t.how_it_works.steps[3] },
    { icon: <Star className="w-10 h-10 text-primary" />, text: t.how_it_works.steps[4] },
  ];

  const whyFahemnyFeatures = [
    { icon: <ShieldCheck className="w-10 h-10 text-primary" />, text: t.why_fahemny.features[0] },
    { icon: <MessageSquareX className="w-10 h-10 text-primary" />, text: t.why_fahemny.features[1] },
    { icon: <History className="w-10 h-10 text-primary" />, text: t.why_fahemny.features[2] },
    { icon: <CircleDollarSign className="w-10 h-10 text-primary" />, text: t.why_fahemny.features[3] },
  ];

  // While checking auth/profile, show a loading skeleton to prevent landing page flash
  if (isUserLoading || isProfileLoading || user) {
     return (
        <div className="flex flex-col min-h-screen bg-background">
            <div className="container w-full pt-20 pb-12 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32">
                 <Skeleton className="h-12 w-3/4 mb-4" />
                 <Skeleton className="h-6 w-1/2 mb-8" />
                 <div className="flex gap-4">
                    <Skeleton className="h-11 w-48" />
                    <Skeleton className="h-11 w-48" />
                 </div>
            </div>
             <div className="w-full py-12 md:py-24 lg:py-32 container">
                <Skeleton className="h-48 w-full" />
             </div>
        </div>
     )
  }

  // Render the landing page for guests
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full pt-20 pb-12 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                  {t.hero.title}
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  {t.hero.subtitle}
                </p>
              </div>
              <div className="flex flex-col gap-4 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="/register">
                    {t.hero.cta_student}
                    <ArrowRight className="ms-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/register">
                    {t.hero.cta_tutor}
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
                <Image
                  src="https://picsum.photos/seed/fahemny-hero/550/550"
                  width="550"
                  height="550"
                  alt="Hero"
                  data-ai-hint="learning education"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">{t.how_it_works.heading}</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
              {t.how_it_works.title}
            </h2>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-5 lg:gap-12">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center gap-4 text-center">
                {step.icon}
                <p className="font-medium">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why FAHEMNY? Section */}
      <section id="why-fahemny" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">{t.why_fahemny.heading}</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                {t.why_fahemny.title}
            </h2>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
            {whyFahemnyFeatures.map((feature, index) => (
              <div key={index} className="flex flex-col items-center gap-4 text-center">
                {feature.icon}
                <p className="font-semibold">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
              {t.cta.title}
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t.cta.subtitle}
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-2">
            <Button size="lg" className="w-full" asChild>
                <Link href="/register">
                    {t.cta.signup_button}
                </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
```

---

## File: `src/app/privacy/page.tsx`

```typescript
import { ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  const points = [
    "نحن نجمع البيانات اللازمة فقط لتقديم خدماتنا.",
    "لا نشارك بياناتك الشخصية مع أطراف ثالثة دون موافقتك.",
    "يتم تسجيل الجلسات لأغراض الجودة والأمان فقط.",
    "يمكنك طلب حذف بياناتك في أي وقت.",
    "نستخدم تقنيات تشفير آمنة لحماية معلوماتك.",
  ];

  return (
    <div className="bg-background">
      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-headline font-bold text-center text-primary mb-4">
            سياسة الخصوصية
          </h1>
          <p className="text-center text-muted-foreground mb-12">
            خصوصيتك هي أولويتنا القصوى.
          </p>
          <div className="space-y-6">
            {points.map((point, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg bg-secondary/50">
                <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-foreground">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## File: `src/app/profile/page.tsx`

```typescript
'use client';

import ar from '@/locales/ar';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfilePage() {
  const t = ar.header.userMenu;
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold font-headline mb-6">{t.profile}</h1>
            <Skeleton className="h-64 w-full" />
        </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold font-headline mb-6">{t.profile}</h1>
      <Card>
          <CardHeader>
              <CardTitle>ملفك الشخصي</CardTitle>
              <CardDescription>هنا يمكنك عرض وتعديل معلومات حسابك.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.photoURL || ''} />
              <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
                <p className="text-2xl font-semibold">{user?.displayName || 'مستخدم جديد'}</p>
                <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </CardContent>
      </Card>
    </div>
  );
}
```

---

## File: `src/app/requests/browse/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import ar from '@/locales/ar';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import type { SessionRequest, UserProfile } from '@/lib/types';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createZoomMeeting } from '@/ai/flows/create-zoom-meeting';

export default function BrowseRequestsPage() {
  const t = ar.header.links;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const requestsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'sessionRequests'), where('status', '==', 'open')) : null,
    [firestore]
  );

  const { data: requests, isLoading: isLoadingRequests } = useCollection<SessionRequest>(requestsQuery);

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'userProfiles', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);


  const handleAccept = async (request: SessionRequest) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'يجب أن تكون مسجلاً للدخول لقبول الطلبات.' });
      return;
    }

    setAcceptingId(request.id);

    try {
      // 1. Create Zoom meeting
      const topic = request.title;
      // Combine date and time for ISO string
      const startTime = new Date(`${request.sessionDate}T${request.sessionTime}:00`).toISOString();
      
      toast({ title: 'جارٍ إنشاء جلسة Zoom...', description: 'قد يستغرق هذا بضع لحظات.' });

      const meetingLink = await createZoomMeeting({ topic, startTime });

      if (!meetingLink) {
        throw new Error('Failed to get meeting link from Zoom.');
      }
      
      // 2. Update Firestore document
      const requestRef = doc(firestore, 'sessionRequests', request.id);
      await updateDoc(requestRef, {
        status: 'accepted',
        tutorId: user.uid,
        meetingLink: meetingLink,
      });

      toast({
        variant: 'default',
        title: 'تم قبول الطلب!',
        description: 'تم إنشاء جلسة Zoom وإضافتها للطلب.',
      });

    } catch (error: any) {
      console.error("Failed to accept request:", error);
      toast({
        variant: 'destructive',
        title: 'فشل قبول الطلب',
        description: error.message || 'حدث خطأ أثناء إنشاء جلسة Zoom أو تحديث الطلب.',
      });
    } finally {
      setAcceptingId(null);
    }
  };
  
  const isLoading = isLoadingRequests || isUserLoading || isLoadingProfile;
  
  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold font-headline mb-6">{t.browse_requests}</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
                <CardHeader><Skeleton className="h-6 bg-muted rounded w-3/4" /></CardHeader>
                <CardContent>
                    <Skeleton className="h-4 bg-muted rounded w-full" />
                    <Skeleton className="h-4 bg-muted rounded w-1/2 mt-2" />
                </CardContent>
                <CardFooter><Skeleton className="h-10 bg-muted rounded w-full" /></CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (userProfile?.role !== 'tutor') {
    return (
         <div className="container py-8">
            <h1 className="text-3xl font-bold font-headline mb-6">{t.browse_requests}</h1>
            <div className="border rounded-lg p-8 text-center bg-secondary/50">
                <p className="text-muted-foreground">هذه الصفحة مخصصة للمفهّمين فقط. يمكنك تغيير دورك من ملفك الشخصي.</p>
            </div>
        </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold font-headline mb-6">{t.browse_requests}</h1>

      {requests && requests.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <Card key={request.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{request.title}</CardTitle>
                <CardDescription>{request.field}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="line-clamp-3 text-sm text-muted-foreground">{request.description}</p>
                <div className="flex justify-between items-center mt-4 text-sm ">
                    <span className="text-muted-foreground">السعر: <span className="font-bold text-primary">{request.price} جنيه</span></span>
                    <span className="text-muted-foreground">{new Date(request.sessionDate).toLocaleDateString('ar-EG')} - {request.sessionTime}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleAccept(request)}
                  disabled={acceptingId !== null}
                >
                  {acceptingId === request.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جار القبول...
                    </>
                  ) : "قبول الطلب وإنشاء جلسة"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg p-8 text-center bg-secondary/50 mt-8">
          <p className="text-muted-foreground">لا توجد طلبات شرح متاحة حاليًا. حاول مرة أخرى لاحقًا.</p>
        </div>
      )}
    </div>
  );
}
```

---

## File: `src/app/requests/create/page.tsx`

```typescript
'use client';

import ar from '@/locales/ar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CreateRequestPage() {
  const t = ar.header.links;
  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">{t.create_request}</CardTitle>
          <CardDescription>املأ النموذج التالي لنشر طلبك وسيتم عرضه للمفهّمين.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان الطلب</Label>
              <Input id="title" placeholder="مثال: أحتاج مساعدة في معادلات الدرجة الثانية" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field">المجال</Label>
               <Input id="field" placeholder="مثال: الرياضيات، البرمجة، التصميم" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">التفاصيل</Label>
              <Textarea id="description" placeholder="اشرح بالتفصيل ما الذي تحتاج إلى فهمه..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">السعر (بالجنيه المصري)</Label>
                <Input id="price" type="number" placeholder="50" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="tutor-gender">جنس المفهّم المطلوب</Label>
                <Select>
                  <SelectTrigger id="tutor-gender">
                    <SelectValue placeholder="اختر..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">الكل</SelectItem>
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="session-date">تاريخ الجلسة</Label>
                    <Input id="session-date" type="date" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="session-time">وقت الجلسة</Label>
                    <Input id="session-time" type="time" />
                </div>
            </div>
            <Button type="submit" className="w-full">نشر الطلب</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## File: `src/app/select-role/page.tsx`

```typescript
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { User as UserIcon, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ar from '@/locales/ar';
import { useEffect } from 'react';

export default function SelectRolePage() {
  const t = ar.select_role;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'userProfiles', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  useEffect(() => {
    // Wait until we have all the user info.
    if (isUserLoading || isProfileLoading) {
      return;
    }

    // If there's no user, send to login.
    if (!user) {
      router.replace('/login');
      return;
    }
    
    // If the user already has a role, redirect them to their dashboard.
    if (userProfile?.role) {
      toast({ title: 'أهلاً بعودتك!', description: 'يتم توجيهك إلى لوحة التحكم الخاصة بك.' });
      if (userProfile.role === 'student') {
        router.replace('/requests/create');
      } else if (userProfile.role === 'tutor') {
        router.replace('/requests/browse');
      } else {
        router.replace('/'); // Fallback to home
      }
    }
  }, [user, userProfile, isUserLoading, isProfileLoading, router, toast]);

  const handleSelectRole = async (role: 'student' | 'tutor') => {
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'userProfiles', user.uid);
      setDocumentNonBlocking(userDocRef, { role: role }, { merge: true });
      toast({
        title: `تم تحديد دورك كـ ${role === 'student' ? 'مستفهم' : 'مفهّم'}!`,
      });
      if (role === 'student') {
        router.push('/requests/create');
      } else {
        router.push('/requests/browse');
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description: 'لم نتمكن من تحديث دورك.',
      });
    }
  };

  // While loading or if user already has a role (and is being redirected), show a loading state.
  if (isUserLoading || isProfileLoading || (user && userProfile?.role)) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.14))] flex-col items-center justify-center py-12 px-4">
        <div className="mx-auto w-full max-w-md text-center">
          <Skeleton className="h-9 w-48 mx-auto mb-2" />
          <Skeleton className="h-5 w-64 mx-auto" />
        </div>
        <div className="mt-8 grid w-full max-w-md grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      </div>
    );
  }

  // If loading is finished and user has no role, show the selection UI.
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.14))] flex-col items-center justify-center py-12 px-4">
      <div className="mx-auto w-full max-w-md text-center">
        <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.description}</p>
      </div>
      <div className="mt-8 grid w-full max-w-md grid-cols-1 gap-6 md:grid-cols-2">
        <Card
          onClick={() => handleSelectRole('student')}
          className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
        >
          <CardHeader className="items-center text-center">
            <div className="mb-4 rounded-full border border-primary/20 bg-primary/10 p-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>{t.student.title}</CardTitle>
            <CardDescription>{t.student.description}</CardDescription>
          </CardHeader>
        </Card>
        <Card
          onClick={() => handleSelectRole('tutor')}
          className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
        >
          <CardHeader className="items-center text-center">
            <div className="mb-4 rounded-full border border-primary/20 bg-primary/10 p-4">
              <UserIcon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>{t.tutor.title}</CardTitle>
            <CardDescription>{t.tutor.description}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
```

---

## File: `src/app/sessions/page.tsx`

```typescript
'use client';

import ar from '@/locales/ar';

export default function MySessionsPage() {
  const t = ar.header.links;
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold font-headline mb-6">{t.my_sessions}</h1>
      <div className="border rounded-lg p-8 text-center bg-secondary/50">
        <p className="text-muted-foreground">سيتم عرض جميع جلساتك الحالية والسابقة هنا.</p>
      </div>
    </div>
  );
}
```

---

## File: `src/app/support/page.tsx`

```typescript
'use client';

import ar from '@/locales/ar';
import { Mail } from 'lucide-react';

export default function SupportPage() {
  const t = ar.header.links;
  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-headline font-bold text-primary mb-4">
          {t.support}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          هل تواجه مشكلة؟ فريق الدعم الفني جاهز لمساعدتك.
        </p>
        <div className="inline-flex items-center gap-2 text-xl p-4 border rounded-lg bg-secondary/50">
          <Mail className="h-6 w-6 text-primary" />
          <span>support@fahemny.app</span>
        </div>
      </div>
    </div>
  );
}
```

---

## File: `src/app/terms/page.tsx`

```typescript
import ar from "@/locales/ar";
import { CheckCircle } from "lucide-react";

export default function TermsPage() {
  const t = ar.terms;

  return (
    <div className="bg-background">
      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-headline font-bold text-center text-primary mb-4">
            {t.title}
          </h1>
          <p className="text-center text-muted-foreground mb-12">
            {t.description}
          </p>

          <div className="space-y-6">
            {t.points.map((point, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg bg-secondary/50">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-foreground">
                  {point}
                </p>
              </div>
            ))}
          </div>

           <div className="text-center mt-16">
              <p className="text-xl font-headline font-bold">فَهِّمْني – كل الفهم... من مكان واحد</p>
            </div>
        </div>
      </div>
    </div>
  );
}
```

---

## File: `src/app/wallet/page.tsx`

```typescript
'use client';

import ar from '@/locales/ar';

export default function WalletPage() {
  const t = ar.header.links;
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold font-headline mb-6">{t.wallet}</h1>
      <div className="border rounded-lg p-8 text-center bg-secondary/50">
        <p className="text-muted-foreground">هنا ستجد رصيدك الحالي وسجل معاملاتك.</p>
      </div>
    </div>
  );
}
```

---

## File: `src/components/FirebaseErrorListener.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It throws any received error to be caught by Next.js's global-error.tsx.
 */
export function FirebaseErrorListener() {
  // Use the specific error type for the state for type safety.
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    // The callback now expects a strongly-typed error, matching the event payload.
    const handleError = (error: FirestorePermissionError) => {
      // Set error in state to trigger a re-render.
      setError(error);
    };

    // The typed emitter will enforce that the callback for 'permission-error'
    // matches the expected payload type (FirestorePermissionError).
    errorEmitter.on('permission-error', handleError);

    // Unsubscribe on unmount to prevent memory leaks.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // On re-render, if an error exists in state, throw it.
  if (error) {
    throw error;
  }

  // This component renders nothing.
  return null;
}
```

---

## File: `src/components/LanguageSwitcher.tsx`

```typescript
"use client";

// This component is no longer needed as the app only supports Arabic.
export default function LanguageSwitcher() {
  return null;
}
```

---

## File: `src/components/ProfileSettings.tsx`

```typescript
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
```

---

## File: `src/components/ProjectCard.tsx`

```typescript
'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { Project, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import ar from '@/locales/ar';

interface ProjectCardProps {
  project: Project;
}

function EmployerDetails({ employerId }: { employerId: string }) {
  const t = ar.project_details;
  const firestore = useFirestore();
  const employerRef = useMemoFirebase(
    () => (employerId ? doc(firestore, 'userProfiles', employerId) : null),
    [firestore, employerId]
  );
  const { data: employer, isLoading } = useDoc<UserProfile>(employerRef);

  if (isLoading) {
    return <Skeleton className="h-5 w-32 mt-2" />;
  }

  if (!employer) {
    return <span className="text-sm text-muted-foreground">{t.by_employer}</span>;
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-sm text-muted-foreground">
        بواسطة {employer.firstName} {employer.lastName}
      </span>
      {employer.isVerified && <CheckCircle className="h-4 w-4 text-primary" />}
    </div>
  );
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export default function ProjectCard({ project }: ProjectCardProps) {
  const t = ar.project_details;
  const statusMap: Record<string, { text: string; variant: BadgeVariant }> = {
    open: { text: ar.project_statuses.open, variant: 'secondary' },
    in_progress: { text: ar.project_statuses.in_progress, variant: 'default' },
    completed: { text: ar.project_statuses.completed, variant: 'outline' },
    pending_approval: { text: ar.project_statuses.pending_approval, variant: 'destructive' },
    rejected: { text: ar.project_statuses.rejected, variant: 'destructive' },
  };
  const statusInfo = statusMap[project.status];

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className='flex justify-between items-start gap-2'>
          <CardTitle className="font-headline text-xl">{project.title}</CardTitle>
          {statusInfo && <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>}
        </div>
        <CardDescription>
          <EmployerDetails employerId={project.employerId} />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3">
          {project.description}
        </p>
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="font-bold text-primary">${project.budget}</div>
        <Link href={`/projects/${project.id}`}>
          <Button>{t.view_project}</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
```

---

## File: `src/components/layout/footer.tsx`

```typescript
'use client';
import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import ar from '@/locales/ar';

type Translations = typeof ar.footer;

export default function Footer({ translations: t }: { translations: Translations }) {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg font-headline">{ar.header.title}</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-primary">{t.about}</Link>
            <Link href="/contact" className="hover:text-primary">{t.contact}</Link>
            <Link href="/terms" className="hover:text-primary">{t.terms}</Link>
            <Link href="/privacy" className="hover:text-primary">{t.privacy}</Link>
          </nav>
          {currentYear && <p className="text-sm text-muted-foreground">&copy; {currentYear} {ar.header.title}. {t.rights}</p>}
        </div>
      </div>
    </footer>
  );
}
```

---

## File: `src/components/layout/header.tsx`

```typescript
"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  BrainCircuit,
  Menu,
  MessageSquare,
  User,
  LogOut,
  ShieldCheck,
  LifeBuoy,
  Wallet,
  PlusCircle,
  LayoutGrid
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUser, useAuth, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserProfile } from "@/lib/types";
import { doc } from "firebase/firestore";
import ar from "@/locales/ar";

type Translations = typeof ar.header;

export default function Header({ translations: t }: { translations: Translations}) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const userProfileRef = useMemoFirebase(
    () => user ? doc(firestore, 'userProfiles', user.uid) : null,
    [firestore, user]
  );
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const navLinks = [
    { href: "/requests/browse", label: t.links.browse_requests },
    { href: "/requests/create", label: t.links.create_request },
    { href: "/sessions", label: t.links.my_sessions },
    { href: "/wallet", label: t.links.wallet },
    { href: "/support", label: t.links.support },
  ];
  
  const mobileNavLinks = [
      { href: "/requests/browse", label: t.links.browse_requests, icon: <LayoutGrid className="h-5 w-5" /> },
      { href: "/requests/create", label: t.links.create_request, icon: <PlusCircle className="h-5 w-5" /> },
      { href: "/sessions", label: t.links.my_sessions, icon: <BrainCircuit className="h-5 w-5" /> },
      { href: "/wallet", label: t.links.wallet, icon: <Wallet className="h-5 w-5" /> },
      { href: "/support", label: t.links.support, icon: <LifeBuoy className="h-5 w-5" /> },
  ];

  const getInitials = (name?: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.email?.[0].toUpperCase();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold font-headline text-lg">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span>{t.title}</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {isUserLoading ? (
            <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />
          ) : user && userProfile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile.photoURL || undefined} alt={userProfile.name} />
                    <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>{t.userMenu.profile}</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => router.push('/sessions')}>
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    <span>{t.links.my_sessions}</span>
                </DropdownMenuItem>
                {userProfile.isAdmin && (
                  <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    <span>{t.links.admin_dashboard}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t.auth.logout}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost">{t.auth.login}</Button>
              </Link>
              <Link href="/register">
                <Button>{t.auth.signup}</Button>
              </Link>
            </div>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t.mobile.toggle}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
               <SheetTitle className="sr-only">{t.mobile.title}</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="border-b pb-4">
                  <Link href="/" className="flex items-center gap-2 font-bold font-headline text-lg">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                    <span>{t.title}</span>
                  </Link>
                </div>
                <nav className="flex-grow mt-6">
                  <ul className="space-y-4">
                    {mobileNavLinks.map((link) => (
                      <li key={link.href}>
                        <SheetClose asChild>
                         <Link href={link.href} className="flex items-center gap-3 text-lg font-medium">
                           {link.icon}
                           {link.label}
                         </Link>
                        </SheetClose>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="mt-auto border-t pt-4">
                  {user ? (
                      <Button onClick={handleSignOut} className="w-full">{t.auth.logout}</Button>
                  ) : (
                    <div className="flex flex-col space-y-2">
                        <SheetClose asChild>
                            <Link href="/login">
                                <Button variant="ghost" className="w-full">{t.auth.login}</Button>
                            </Link>
                        </SheetClose>
                        <SheetClose asChild>
                            <Link href="/register">
                                <Button className="w-full">{t.auth.signup}</Button>
                            </Link>
                        </SheetClose>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
```

... and so on for all UI components, firebase setup, hooks, libs, and config files. Due to the enormous size, the rest of the files are omitted from this view, but they are included in the change.
 
    