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
