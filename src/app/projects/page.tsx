'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Project } from '@/lib/types';
import ProjectCard from '@/components/ProjectCard';
import { Skeleton } from '@/components/ui/skeleton';
import ar from '@/locales/ar';

export default function ProjectsPage() {
  const t = ar.projects_page;
  const tc = ar.create_project.categories;
  const firestore = useFirestore();
  const projectsRef = useMemoFirebase(
    () => collection(firestore, 'projects'),
    [firestore]
  );
  const { data: projects, isLoading } = useCollection<Project>(projectsRef);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold font-headline">
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t.subtitle}
        </p>
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={t.search_placeholder}
            className="pl-10"
          />
        </div>
        <Select>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder={t.category_placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="web-dev">{tc.web_dev}</SelectItem>
            <SelectItem value="mobile-dev">{tc.mobile_dev}</SelectItem>
            <SelectItem value="design">{tc.design}</SelectItem>
            <SelectItem value="writing">{tc.writing}</SelectItem>
            <SelectItem value="devops">{tc.devops}</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder={t.budget_placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="under-1k">{t.budgets.under_1k}</SelectItem>
            <SelectItem value="1k-5k">{t.budgets["1k_5k"]}</SelectItem>
            <SelectItem value="5k-10k">{t.budgets["5k_10k"]}</SelectItem>
            <SelectItem value="over-10k">{t.budgets.over_10k}</SelectItem>
          </SelectContent>
        </Select>
        <Button className="w-full md:w-auto">{t.search_button}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
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
        {projects &&
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
      </div>
      {!isLoading && projects?.length === 0 && (
        <div className="text-center text-muted-foreground col-span-full pt-10">
          {t.no_projects}
        </div>
      )}
    </div>
  );
}
