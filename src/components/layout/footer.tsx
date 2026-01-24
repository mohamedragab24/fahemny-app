'use client';
import Link from 'next/link';
import { Briefcase } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import type ar from '@/locales/ar';

type Translations = typeof ar.footer;

export default function Footer({ translations: t }: { translations: Translations }) {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg font-headline">كونكت ناو</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-primary">{t.about}</Link>
            <Link href="/contact" className="hover:text-primary">{t.contact}</Link>
            <Link href="/terms" className="hover:text-primary">{t.terms}</Link>
            <Link href="/privacy" className="hover:text-primary">{t.privacy}</Link>
          </nav>
          {currentYear && <p className="text-sm text-muted-foreground">&copy; {currentYear} كونكت ناو. {t.rights}</p>}
        </div>
      </div>
    </footer>
  );
}
