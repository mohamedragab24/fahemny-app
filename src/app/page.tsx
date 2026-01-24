import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Briefcase, DollarSign, Search, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import ar from "@/locales/ar";

export default async function Home() {
  const t = ar;
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');
  const employerImage = PlaceHolderImages.find(p => p.id === 'employer-feature');
  const freelancerImage = PlaceHolderImages.find(p => p.id === 'freelancer-feature');

  const features = [
    {
      icon: <Search className="w-8 h-8 text-primary" />,
      title: t.home.features.talent.title,
      description: t.home.features.talent.description,
    },
    {
      icon: <DollarSign className="w-8 h-8 text-primary" />,
      title: t.home.features.payment.title,
      description: t.home.features.payment.description,
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: t.home.features.collaboration.title,
      description: t.home.features.collaboration.description,
    },
    {
      icon: <Briefcase className="w-8 h-8 text-primary" />,
      title: t.home.features.find_work.title,
      description: t.home.features.find_work.description,
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
                  {t.home.hero.title}
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  {t.home.hero.subtitle}
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/projects/create">
                  <Button size="lg" className="w-full min-[400px]:w-auto">
                    {t.home.hero.post_project}
                    <ArrowRight className="ms-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto">
                    {t.home.hero.browse_projects}
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
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">{t.home.features.heading}</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                {t.home.features.title}
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {t.home.features.subtitle}
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
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">{t.home.how_it_works.title}</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {t.home.how_it_works.subtitle}
              </p>
            </div>
          </div>
          <div className="mx-auto grid gap-10 sm:grid-cols-1 md:grid-cols-3 lg:gap-16 mt-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">1</div>
              <h3 className="text-xl font-bold mb-2 font-headline">{t.home.how_it_works.step1.title}</h3>
              <p className="text-muted-foreground">{t.home.how_it_works.step1.description}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">2</div>
              <h3 className="text-xl font-bold mb-2 font-headline">{t.home.how_it_works.step2.title}</h3>
              <p className="text-muted-foreground">{t.home.how_it_works.step2.description}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">3</div>
              <h3 className="text-xl font-bold mb-2 font-headline">{t.home.how_it_works.step3.title}</h3>
              <p className="text-muted-foreground">{t.home.how_it_works.step3.description}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="cta" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
              {t.home.cta.title}
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t.home.cta.subtitle}
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-2">
            <Link href="/register">
              <Button size="lg" className="w-full">
                {t.home.cta.signup}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
