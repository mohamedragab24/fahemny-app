import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projects } from "@/lib/data";
import { CheckCircle, Search } from "lucide-react";
import Link from "next/link";

export default function ProjectsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold font-headline">Find Your Next Project</h1>
        <p className="text-muted-foreground mt-2">
          Browse thousands of opportunities to find the perfect match for your skills.
        </p>
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search by keyword (e.g., 'React', 'UI/UX')" className="pl-10" />
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
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline text-xl">{project.title}</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">by {project.employer.name}</span>
                  {project.employer.verified && <CheckCircle className="h-4 w-4 text-primary" />}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground line-clamp-3">{project.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="font-bold text-primary">${project.budget}</div>
              <Link href={`/projects/${project.id}`}>
                <Button>View Project</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
