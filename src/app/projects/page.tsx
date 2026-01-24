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

export default function ProjectsPage() {
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
          Find Your Next Project
        </h1>
        <p className="text-muted-foreground mt-2">
          Browse thousands of opportunities to find the perfect match for your
          skills.
        </p>
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by keyword (e.g., 'React', 'UI/UX')"
            className="pl-10"
          />
        </div>
        <Select>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="web-dev">Web Development</SelectItem>
            <SelectItem value="mobile-dev">Mobile Development</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="writing">Writing</SelectItem>
            <SelectItem value="devops">DevOps</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Budget" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="under-1k">Under $1,000</SelectItem>
            <SelectItem value="1k-5k">$1,000 - $5,000</SelectItem>
            <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
            <SelectItem value="over-10k">Over $10,000</SelectItem>
          </SelectContent>
        </Select>
        <Button className="w-full md:w-auto">Search</Button>
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
          No projects found.
        </div>
      )}
    </div>
  );
}
