import ar from "@/locales/ar";
import { Info } from "lucide-react";

export default function AboutPage() {
  const t = ar.home.about;
  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-headline font-bold text-primary mb-4">
            {ar.footer.about}
          </h1>
          <p className="text-xl text-muted-foreground">{t.vision_title}</p>
        </div>
        <div className="space-y-8">
          <div className="p-6 border rounded-lg bg-secondary/50">
            <h2 className="text-2xl font-headline font-semibold mb-2">{t.vision_title}</h2>
            <p>{t.vision_description}</p>
          </div>
          <div className="p-6 border rounded-lg bg-secondary/50">
            <h2 className="text-2xl font-headline font-semibold mb-2">{t.mission_title}</h2>
            <p>{t.mission_description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
