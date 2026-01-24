import ar from "@/locales/ar";
import { CheckCircle } from "lucide-react";

export default function TermsPage() {
  const t = ar.terms;

  return (
    <div className="bg-background">
      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-headline font-bold text-center text-primary mb-4">
            {t.title}
          </h1>
          <p className="text-center text-muted-foreground mb-12">
            {t.description}
          </p>

          <div className="space-y-6">
            {t.points.map((point, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg bg-secondary/50">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-foreground">
                  {point}
                </p>
              </div>
            ))}
          </div>

           <div className="text-center mt-16">
              <p className="text-xl font-headline font-bold">فَهِّمْني – كل الفهم... من مكان واحد</p>
            </div>
        </div>
      </div>
    </div>
  );
}
