import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { projects } from "@/lib/data";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-2 font-headline">My Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome back! Here&apos;s an overview of your activity.
      </p>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="proposals">My Proposals</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>
                Projects you have posted or are currently working on.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.slice(0, 2).map((project) => (
                <div key={project.id} className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">Status: In Progress</p>
                  </div>
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="outline">View Project</Button>
                  </Link>
                </div>
              ))}
               <div className="text-center text-muted-foreground pt-4">No more projects.</div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="proposals">
          <Card>
            <CardHeader>
              <CardTitle>Submitted Proposals</CardTitle>
              <CardDescription>
                Proposals you have submitted for various projects.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {projects.slice(2, 4).map((project) => (
                <div key={project.id} className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">Status: Submitted</p>
                  </div>
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="outline">View Project</Button>
                  </Link>
                </div>
              ))}
              <div className="text-center text-muted-foreground pt-4">No more proposals.</div>
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
