import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Briefcase, DollarSign, Search, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');
  const employerImage = PlaceHolderImages.find(p => p.id === 'employer-feature');
  const freelancerImage = PlaceHolderImages.find(p => p.id === 'freelancer-feature');

  const features = [
    {
      icon: <Search className="w-8 h-8 text-primary" />,
      title: "Find the Perfect Talent",
      description: "Post a job and get proposals from talented freelancers in minutes.",
    },
    {
      icon: <DollarSign className="w-8 h-8 text-primary" />,
      title: "Fixed-Price or Hourly",
      description: "Choose how you want to pay, with secure payments and milestone tracking.",
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Collaborate Easily",
      description: "Use our platform to chat, share files, and track project progress.",
    },
    {
      icon: <Briefcase className="w-8 h-8 text-primary" />,
      title: "Find Your Next Project",
      description: "Browse thousands of projects and find work that matches your skills.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative w-full pt-20 pb-12 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                  ConnectNow: Where Vision Meets Talent
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  The ultimate platform for businesses to connect with skilled freelancers. Post projects, get proposals, and get work done.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/projects/create">
                  <Button size="lg" className="w-full min-[400px]:w-auto">
                    Post a Project
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto">
                    Browse Projects
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  width="550"
                  height="550"
                  alt="Hero"
                  data-ai-hint={heroImage.imageHint}
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                Everything You Need to Succeed
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                ConnectNow provides a seamless and secure environment for both employers and freelancers to thrive.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-2 mt-12">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">{feature.icon}</div>
                <div className="grid gap-1">
                  <h3 className="text-lg font-bold font-headline">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">How It Works</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Getting started is simple. Follow these three easy steps.
              </p>
            </div>
          </div>
          <div className="mx-auto grid gap-10 sm:grid-cols-1 md:grid-cols-3 lg:gap-16 mt-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">1</div>
              <h3 className="text-xl font-bold mb-2 font-headline">Post a Job</h3>
              <p className="text-muted-foreground">Describe your project, set your budget, and publish it for our community of freelancers.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">2</div>
              <h3 className="text-xl font-bold mb-2 font-headline">Hire a Freelancer</h3>
              <p className="text-muted-foreground">Review proposals, check profiles and portfolios, and hire the perfect candidate for your job.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">3</div>
              <h3 className="text-xl font-bold mb-2 font-headline">Get It Done</h3>
              <p className="text-muted-foreground">Collaborate with your freelancer, pay securely through our platform, and approve the final work.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="cta" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
              Ready to bring your ideas to life?
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join ConnectNow today and start your journey towards success, whether you're looking for talent or seeking new opportunities.
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-2">
            <Link href="/register">
              <Button size="lg" className="w-full">
                Sign Up for Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
