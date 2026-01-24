import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg font-headline">ConnectNow</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-primary">About</Link>
            <Link href="/contact" className="hover:text-primary">Contact</Link>
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
          </nav>
          <p className="text-sm text-muted-foreground">&copy; {currentYear} ConnectNow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
