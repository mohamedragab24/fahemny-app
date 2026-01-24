import ar from "@/locales/ar";
import { Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-headline font-bold text-primary mb-4">
          {ar.footer.contact}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          نحن هنا للمساعدة. تواصل معنا عبر البريد الإلكتروني.
        </p>
        <div className="inline-flex items-center gap-2 text-xl p-4 border rounded-lg bg-secondary/50">
          <Mail className="h-6 w-6 text-primary" />
          <span>contact@fahemny.app</span>
        </div>
      </div>
    </div>
  );
}
