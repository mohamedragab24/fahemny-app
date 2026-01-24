import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, Rocket, CheckCircle, XCircle, ListChecks, Target, Presentation, ThumbsUp, Banknote, Percent, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ar from "@/locales/ar";

export default async function Home() {
  const t = ar.home;

  const workflowSteps = [
    {
      icon: <ListChecks className="w-8 h-8 text-primary" />,
      title: t.workflow.create_request.title,
      description: t.workflow.create_request.description,
    },
    {
      icon: <Target className="w-8 h-8 text-primary" />,
      title: t.workflow.view_and_accept.title,
      description: t.workflow.view_and_accept.description,
    },
    {
      icon: <Presentation className="w-8 h-8 text-primary" />,
      title: t.workflow.pay_and_session.title,
      description: t.workflow.pay_and_session.description,
    },
    {
      icon: <ThumbsUp className="w-8 h-8 text-primary" />,
      title: t.workflow.feedback.title,
      description: t.workflow.feedback.description,
    },
  ];

  const paymentFeatures = [
    {
      icon: <Banknote className="w-8 h-8 text-primary" />,
      title: t.payment.price.title,
      description: t.payment.price.description,
    },
    {
      icon: <Percent className="w-8 h-8 text-primary" />,
      title: t.payment.commission.title,
      description: t.payment.commission.description,
    },
    {
      icon: <Wallet className="w-8 h-8 text-primary" />,
      title: t.payment.methods.title,
      description: t.payment.methods.description,
    },
  ];


  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full pt-20 pb-12 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                  {t.hero.title}
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  {t.hero.subtitle}
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="/register">
                    {t.hero.cta_button}
                    <ArrowRight className="ms-2 h-4 w-4" />
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

      {/* About Section */}
      <section id="about" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">{t.about.heading}</div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-12 lg:grid-cols-2">
            <div className="grid gap-4 text-center">
              <div className="flex justify-center">
                <Eye className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold font-headline">{t.about.vision_title}</h3>
              <p className="text-muted-foreground">{t.about.vision_description}</p>
            </div>
            <div className="grid gap-4 text-center">
               <div className="flex justify-center">
                <Rocket className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold font-headline">{t.about.mission_title}</h3>
              <p className="text-muted-foreground">{t.about.mission_description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">{t.workflow.heading}</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                {t.workflow.title}
              </h2>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:grid-cols-4 md:gap-12 mt-12">
            {workflowSteps.map((step, index) => (
              <div key={index} className="grid gap-2 text-center">
                <div className="flex justify-center">{step.icon}</div>
                <h3 className="text-lg font-bold font-headline">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

       {/* Fields Section */}
      <section id="fields" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">{t.fields.heading}</div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-12 lg:grid-cols-2">
            <div className="grid gap-4">
              <h3 className="text-2xl font-bold font-headline text-center">{t.fields.allowed_title}</h3>
              <ul className="space-y-2">
                {t.fields.allowed_examples.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                    </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4">
              <h3 className="text-2xl font-bold font-headline text-center">{t.fields.forbidden_title}</h3>
              <ul className="space-y-2">
                {t.fields.forbidden_examples.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                    </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Section */}
      <section id="payment" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">{t.payment.heading}</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                {t.payment.title}
              </h2>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-3 md:gap-12 mt-12">
            {paymentFeatures.map((feature, index) => (
              <div key={index} className="grid gap-2 text-center">
                <div className="flex justify-center">{feature.icon}</div>
                <h3 className="text-lg font-bold font-headline">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
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
