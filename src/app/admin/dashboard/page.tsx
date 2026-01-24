"use client";

import { useCollection, useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { collection, doc, query, where } from "firebase/firestore";
import type { UserProfile, Project } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import ar from "@/locales/ar";

function UserTable() {
  const t = ar.admin;
  const firestore = useFirestore();
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(
    () => collection(firestore, "userProfiles"),
    [firestore]
  );
  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const handleVerification = async (user: UserProfile, verify: boolean) => {
    const userDocRef = doc(firestore, "userProfiles", user.id);
    try {
      setDocumentNonBlocking(userDocRef, { isVerified: verify }, { merge: true });
      toast({
        title: verify ? t.toasts.verify_success : t.toasts.unverify_success,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t.toasts.update_error,
      });
      console.error(error);
    }
  };
  
  const handleMakeAdmin = async (user: UserProfile) => {
    const userDocRef = doc(firestore, "userProfiles", user.id);
    try {
      setDocumentNonBlocking(userDocRef, { isAdmin: true }, { merge: true });
      toast({
        title: t.toasts.make_admin_success,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t.toasts.update_error,
      });
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t.user_table.name}</TableHead>
          <TableHead>{t.user_table.email}</TableHead>
          <TableHead>{t.user_table.user_type}</TableHead>
          <TableHead className="text-center">{t.user_table.verified}</TableHead>
          <TableHead className="text-center">{t.user_table.admin}</TableHead>
          <TableHead className="text-right">{t.user_table.actions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users?.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.photoURL} />
                  <AvatarFallback>
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant="secondary">{ar.user_types[user.userType]}</Badge>
            </TableCell>
            <TableCell className="text-center">
              {user.isVerified ? (
                <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mx-auto" />
              )}
            </TableCell>
            <TableCell className="text-center">
              {user.isAdmin ? (
                <CheckCircle className="h-5 w-5 text-primary mx-auto" />
              ) : (
                <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
              )}
            </TableCell>
            <TableCell className="text-right space-x-2">
              {user.isVerified ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleVerification(user, false)}
                >
                  {t.user_table.unverify_button}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleVerification(user, true)}
                >
                  {t.user_table.verify_button}
                </Button>
              )}
              {!user.isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMakeAdmin(user)}
                >
                  {t.user_table.make_admin_button}
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EmployerCell({ employerId }: { employerId: string }) {
    const firestore = useFirestore();
    const employerRef = useMemoFirebase(
        () => doc(firestore, 'userProfiles', employerId),
        [firestore, employerId]
    );
    const { data: employer, isLoading } = useDoc<UserProfile>(employerRef);

    if(isLoading) return <Skeleton className="h-5 w-24" />

    return <>{employer ? `${employer.firstName} ${employer.lastName}`: 'مستخدم محذوف'}</>
}

function PendingProjectsTable() {
    const t = ar.admin;
    const firestore = useFirestore();
    const { toast } = useToast();

    const projectsQuery = useMemoFirebase(
        () => query(collection(firestore, "projects"), where("status", "==", "pending_approval")),
        [firestore]
    );
    const { data: projects, isLoading } = useCollection<Project>(projectsQuery);

    const handleProjectStatusChange = async (project: Project, status: 'open' | 'rejected') => {
        const projectDocRef = doc(firestore, "projects", project.id);
        try {
            setDocumentNonBlocking(projectDocRef, { status: status }, { merge: true });
            toast({
                title: status === 'open' ? t.toasts.project_approve_success : t.toasts.project_reject_success
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: t.toasts.project_update_error
            })
            console.error(error);
        }
    }
    
    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        );
    }
    
    if (!projects || projects.length === 0) {
        return <p className="text-muted-foreground text-center py-4">{t.no_pending_projects}</p>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{t.project_table.title}</TableHead>
                    <TableHead>{t.project_table.employer}</TableHead>
                    <TableHead className="text-center">{t.project_table.budget}</TableHead>
                    <TableHead className="text-center">{t.project_table.submitted}</TableHead>
                    <TableHead className="text-right">{t.project_table.actions}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {projects.map((project) => (
                    <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.title}</TableCell>
                        <TableCell><EmployerCell employerId={project.employerId} /></TableCell>
                        <TableCell className="text-center">${project.budget}</TableCell>
                        <TableCell className="text-center">{new Date(project.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right space-x-2">
                            <Button size="sm" onClick={() => handleProjectStatusChange(project, 'open')}>{t.project_table.approve_button}</Button>
                            <Button variant="destructive" size="sm" onClick={() => handleProjectStatusChange(project, 'rejected')}>{t.project_table.reject_button}</Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default function AdminDashboardPage() {
  const t = ar.admin;
  return (
    <div className="container mx-auto py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-2 font-headline">{t.dashboard_title}</h1>
        <p className="text-muted-foreground">
            {t.dashboard_description}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t.pending_projects_title}</CardTitle>
          <CardDescription>{t.pending_projects_description}</CardDescription>
        </CardHeader>
        <CardContent>
          <PendingProjectsTable />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.users_title}</CardTitle>
          <CardDescription>{t.users_description}</CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable />
        </CardContent>
      </Card>
    </div>
  );
}
