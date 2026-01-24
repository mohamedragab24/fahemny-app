import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { projects, proposals } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { CheckCircle, Clock, DollarSign, User } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const project = projects.find((p) => p.id === params.id);
  const projectImage = PlaceHolderImages.find(p => p.id === 'project-detail-image');


  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-headline">{project.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Deadline: {project.deadline}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{project.proposals} Proposals</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {projectImage && (
                 <div className="mb-6">
                    <Image
                    src={projectImage.imageUrl}
                    width={800}
                    height={400}
                    alt={project.title}
                    data-ai-hint={projectImage.imageHint}
                    className="rounded-lg object-cover w-full aspect-video"
                    />
                 </div>
              )}
              <h3 className="font-semibold text-lg mb-2">Project Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{project.description}</p>
              <Separator className="my-6" />
              <h3 className="font-semibold text-lg mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Submit Your Proposal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rate">Your Hourly Rate ($)</Label>
                <Input id="rate" type="number" placeholder="e.g., 50" className="max-w-xs mt-1" />
              </div>
              <div>
                 <Label htmlFor="cover-letter">Cover Letter</Label>
                <Textarea id="cover-letter" placeholder="Explain why you're the best fit for this project." className="min-h-[150px] mt-1" />
              </div>
              <Button size="lg">Submit Proposal</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{project.proposals} Proposals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {proposals.map(p => (
                <div key={p.id} className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={p.freelancer.avatar} />
                    <AvatarFallback>{p.freelancer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{p.freelancer.name}</p>
                            <p className="text-sm text-muted-foreground">{p.freelancer.title}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-lg">${p.rate}/hr</p>
                            <p className="text-sm text-muted-foreground">{p.date}</p>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 bg-secondary/50 p-3 rounded-md">{p.coverLetter}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Project Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${project.budget}</div>
              <p className="text-xs text-muted-foreground">Fixed Price</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">About the Employer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={project.employer.avatar} />
                        <AvatarFallback>{project.employer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{project.employer.name}</p>
                         <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            {project.employer.verified && <CheckCircle className="h-4 w-4 text-primary" />}
                            <span>{project.employer.verified ? 'Verified' : 'Not Verified'}</span>
                        </div>
                    </div>
               </div>
               <Button className="w-full">View Profile</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
