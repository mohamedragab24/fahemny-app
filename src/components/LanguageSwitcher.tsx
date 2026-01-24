'use client';

import { useChangeLocale, useCurrentLocale } from '@/locales/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Languages } from 'lucide-react';
import type en from '@/locales/en';

type Translations = typeof en.language_switcher;

export default function LanguageSwitcher({ translations: t }: { translations: Translations}) {
  const changeLocale = useChangeLocale();
  const locale = useCurrentLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-5 w-5" />
          <span className="sr-only">{t.change_language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLocale('en')} disabled={locale === 'en'}>
          {t.en}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLocale('ar')} disabled={locale === 'ar'}>
          {t.ar}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
