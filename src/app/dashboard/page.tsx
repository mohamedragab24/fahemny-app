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
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import type { Project, Offer, UserProfile } from "@/lib/types";
import { collection, query, where, doc } from "firebase/firestore";
import ProjectCard from "@/components/ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";
import ar from "@/locales/ar";
import ProfileSettings from "@/components/ProfileSettings";
import { useMemo } from "react";

function ProjectsList({ projects, isLoading }: { projects: Project[] | null, isLoading: boolean }) {
  const t = ar.dashboard;
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

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>{t.no_projects_in_category}</p>
        <Button asChild className="mt-4">
            <Link href="/projects/create">{t.post_project_button}</Link>
        </Button>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}

function EmployerDashboard() {
  const t = ar.dashboard;
  const { user } = useUser();
  const firestore = useFirestore();

  const projectsQuery = useMemoFirebase(
    () => user ? query(collection(firestore, "projects"), where("employerId", "==", user.uid)) : null,
    [firestore, user]
  );
  const { data: allProjects, isLoading } = useCollection<Project>(projectsQuery);

  const projectsByStatus = useMemo(() => {
    const initial = {
      open: [],
      in_progress: [],
      completed: [],
    };
    if (!allProjects) return initial;
    return allProjects.reduce((acc, project) => {
      if (acc[project.status as keyof typeof acc]) {
        acc[project.status as keyof typeof acc].push(project);
      }
      return acc;
    }, initial as Record<string, Project[]>);
  }, [allProjects]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Tabs defaultValue="open" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="open">{t.active_projects}</TabsTrigger>
            <TabsTrigger value="in_progress">{t.in_progress_projects}</TabsTrigger>
            <TabsTrigger value="completed">{t.completed_projects}</TabsTrigger>
          </TabsList>
          <TabsContent value="open">
            <Card>
              <CardHeader><CardTitle>{t.active_projects}</CardTitle></CardHeader>
              <CardContent><ProjectsList projects={projectsByStatus.open} isLoading={isLoading} /></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="in_progress">
             <Card>
              <CardHeader><CardTitle>{t.in_progress_projects}</CardTitle></CardHeader>
              <CardContent><ProjectsList projects={projectsByStatus.in_progress} isLoading={isLoading} /></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="completed">
             <Card>
              <CardHeader><CardTitle>{t.completed_projects}</CardTitle></CardHeader>
              <CardContent><ProjectsList projects={projectsByStatus.completed} isLoading={isLoading} /></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <div className="space-y-6">
        <WalletCard />
      </div>
    </div>
  )
}

function WalletCard() {
    const t = ar.dashboard;
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t.wallet_title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{t.current_balance}</p>
                <p className="text-3xl font-bold">$0.00</p>
            </CardContent>
            <CardFooter>
                <Button disabled>{t.add_funds_button}</Button>
            </CardFooter>
        </Card>
    )
}

function ProposalCard({ offer }: { offer: Offer }) {
    const t = ar.dashboard;
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
                    {t.status_label} <span className="capitalize font-medium text-foreground">{offer.status}</span>
                 </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground line-clamp-2">{offer.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-secondary/50 py-3 px-6">
                <div>
                    <span className="text-sm text-muted-foreground">{t.rate_label} </span>
                    <span className="font-bold text-primary">${offer.rate}</span>
                </div>
                <Button asChild variant="secondary">
                    <Link href={`/projects/${project.id}`}>{ar.project_details.view_project}</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}


function FreelancerProposals() {
    const t = ar.dashboard;
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
                    <p>{t.no_proposals}</p>
                     <Button asChild className="mt-4">
                        <Link href="/projects">{t.browse_projects_button}</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}

export default function DashboardPage() {
  const t = ar.dashboard;
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
        label: t.my_projects,
        Content: <EmployerDashboard />,
      } 
    : { 
        value: 'proposals', 
        label: t.my_proposals,
        Content: <FreelancerProposals />,
      };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
        <p className="text-muted-foreground">
          {t.welcome.replace('{firstName}', userProfile.firstName)}
        </p>
      </div>


      <Tabs defaultValue={mainTab.value} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[300px] mb-6">
          <TabsTrigger value={mainTab.value}>{mainTab.label}</TabsTrigger>
          <TabsTrigger value="settings">{t.settings}</TabsTrigger>
        </TabsList>
        
        <TabsContent value={mainTab.value}>
            {mainTab.Content}
        </TabsContent>

        <TabsContent value="settings">
          <ProfileSettings userProfile={userProfile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
