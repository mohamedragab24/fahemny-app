import { Button } from "@/components/ui/button";
import { ArrowRight, Lightbulb, Banknote, Users, Video, Star, ShieldCheck, MessageSquareX, History, CircleDollarSign } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ar from "@/locales/ar";

export default async function Home() {
  const t = ar.home;

  const howItWorksSteps = [
    { icon: <Lightbulb className="w-10 h-10 text-primary" />, text: t.how_it_works.steps[0] },
    { icon: <Banknote className="w-10 h-10 text-primary" />, text: t.how_it_works.steps[1] },
    { icon: <Users className="w-10 h-10 text-primary" />, text: t.how_it_works.steps[2] },
    { icon: <Video className="w-10 h-10 text-primary" />, text: t.how_it_works.steps[3] },
    { icon: <Star className="w-10 h-10 text-primary" />, text: t.how_it_works.steps[4] },
  ];

  const whyFahemnyFeatures = [
    { icon: <ShieldCheck className="w-10 h-10 text-primary" />, text: t.why_fahemny.features[0] },
    { icon: <MessageSquareX className="w-10 h-10 text-primary" />, text: t.why_fahemny.features[1] },
    { icon: <History className="w-10 h-10 text-primary" />, text: t.why_fahemny.features[2] },
    { icon: <CircleDollarSign className="w-10 h-10 text-primary" />, text: t.why_fahemny.features[3] },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full pt-20 pb-12 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                  {t.hero.title}
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  {t.hero.subtitle}
                </p>
              </div>
              <div className="flex flex-col gap-4 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="/register">
                    {t.hero.cta_student}
                    <ArrowRight className="ms-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/register">
                    {t.hero.cta_tutor}
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
                <Image
                  src="https://picsum.photos/seed/fahemny-hero/550/550"
                  width="550"
                  height="550"
                  alt="Hero"
                  data-ai-hint="learning education"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">{t.how_it_works.heading}</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
              {t.how_it_works.title}
            </h2>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-5 lg:gap-12">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center gap-4 text-center">
                {step.icon}
                <p className="font-medium">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why FAHEMNY? Section */}
      <section id="why-fahemny" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">{t.why_fahemny.heading}</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                {t.why_fahemny.title}
            </h2>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
            {whyFahemnyFeatures.map((feature, index) => (
              <div key={index} className="flex flex-col items-center gap-4 text-center">
                {feature.icon}
                <p className="font-semibold">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
              {t.cta.title}
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t.cta.subtitle}
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-2">
            <Button size="lg" className="w-full" asChild>
                <Link href="/register">
                    {t.cta.signup_button}
                </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
