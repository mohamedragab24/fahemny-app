'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import type { Project, Offer, UserProfile } from "@/lib/types";
import { collection, query, where, doc } from "firebase/firestore";
import ProjectCard from "@/components/ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";

function MyProjects() {
    const { user } = useUser();
    const firestore = useFirestore();

    const projectsQuery = useMemoFirebase(
        () => user ? query(collection(firestore, "projects"), where("employerId", "==", user.uid)) : null,
        [firestore, user]
    );

    const { data: projects, isLoading } = useCollection<Project>(projectsQuery);

    if (isLoading) {
        return (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3 p-4 border rounded-lg">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-12 w-full" />
                        <div className="flex justify-between items-center pt-4">
                            <Skeleton className="h-8 w-1/4" />
                            <Skeleton className="h-10 w-1/3" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div>
            {projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground pt-8 pb-4">
                    <p>You haven&apos;t posted any projects yet.</p>
                    <Button asChild className="mt-4">
                        <Link href="/projects/create">Post a Project</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}

function ProposalCard({ offer }: { offer: Offer }) {
    const firestore = useFirestore();
    const projectRef = useMemoFirebase(
        () => doc(firestore, 'projects', offer.projectId),
        [firestore, offer.projectId]
    );
    const { data: project, isLoading } = useDoc<Project>(projectRef);

    if (isLoading || !project) {
        return (
            <Card>
                <CardContent className="p-6">
                    <Skeleton className="h-5 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                 <CardTitle className="text-lg font-headline">{project.title}</CardTitle>
                 <CardDescription>
                    Status: <span className="capitalize font-medium text-foreground">{offer.status}</span>
                 </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground line-clamp-2">{offer.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-secondary/50 py-3 px-6">
                <div>
                    <span className="text-sm text-muted-foreground">Your Rate: </span>
                    <span className="font-bold text-primary">${offer.rate}</span>
                </div>
                <Button asChild variant="secondary">
                    <Link href={`/projects/${project.id}`}>View Project</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}


function MyProposals() {
    const { user } = useUser();
    const firestore = useFirestore();

    const offersQuery = useMemoFirebase(
        () => user ? query(collection(firestore, "offers"), where("freelancerId", "==", user.uid)) : null,
        [firestore, user]
    );

    const { data: offers, isLoading } = useCollection<Offer>(offersQuery);

     if (isLoading) {
        return (
             <div className="space-y-4">
                 <Skeleton className="h-24 w-full" />
                 <Skeleton className="h-24 w-full" />
            </div>
        )
    }

    return (
        <div>
            {offers && offers.length > 0 ? (
                <div className="space-y-4">
                    {offers.map((offer) => (
                        <ProposalCard key={offer.id} offer={offer} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground pt-8 pb-4">
                    <p>You haven&apos;t submitted any proposals yet.</p>
                     <Button asChild className="mt-4">
                        <Link href="/projects">Browse Projects</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
      () => user ? doc(firestore, 'userProfiles', user.uid) : null,
      [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  if (isUserLoading || isProfileLoading) {
      return (
          <div className="container mx-auto py-10">
              <Skeleton className="h-10 w-1/4 mb-2" />
              <Skeleton className="h-6 w-1/2 mb-8" />
              <div className="flex space-x-4 border-b mb-4">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
              </div>
              <Skeleton className="h-64 w-full" />
          </div>
      )
  }

  if (!user || !userProfile) {
    return (
       <div className="container mx-auto py-10 text-center">
         <h1 className="text-2xl font-bold">Please log in</h1>
         <p className="text-muted-foreground">You need to be logged in to view your dashboard.</p>
         <Button asChild className="mt-4"><Link href="/login">Log In</Link></Button>
       </div>
    )
  }

    const mainTab = userProfile.userType === 'employer' 
    ? { 
        value: 'projects', 
        label: 'My Projects', 
        Content: <MyProjects />,
        description: 'Projects you have posted.'
      } 
    : { 
        value: 'proposals', 
        label: 'My Proposals', 
        Content: <MyProposals />,
        description: 'Proposals you have submitted for various projects.'
      };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-2 font-headline">My Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome back, {userProfile.firstName}! Here&apos;s an overview of your activity.
      </p>

      <Tabs defaultValue={mainTab.value} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[300px]">
          <TabsTrigger value={mainTab.value}>{mainTab.label}</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value={mainTab.value}>
          <Card>
            <CardHeader>
              <CardTitle>{mainTab.label}</CardTitle>
              <CardDescription>
                {mainTab.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {mainTab.Content}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account and notification settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <h3 className="font-semibold">Profile Information</h3>
                    <p className="text-muted-foreground text-sm">Update your personal details and preferences.</p>
                    <Button variant="secondary">Edit Profile</Button>
                </div>
                <Separator />
                <div className="space-y-2">
                    <h3 className="font-semibold">Password</h3>
                    <p className="text-muted-foreground text-sm">Change your password for better security.</p>
                    <Button variant="secondary">Change Password</Button>
                </div>
                <Separator />
                <div className="space-y-2">
                    <h3 className="font-semibold">Notifications</h3>
                    <p className="text-muted-foreground text-sm">Configure your email and push notification settings.</p>
                    <Button variant="secondary">Manage Notifications</Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
