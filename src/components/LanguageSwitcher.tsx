'use client';

import { useChangeLocale, useCurrentLocale, useI18n } from '@/locales/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Languages } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';

function LanguageSwitcherContent() {
  const changeLocale = useChangeLocale();
  const locale = useCurrentLocale();
  const t = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-5 w-5" />
          <span className="sr-only">{t('language_switcher.change_language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLocale('en')} disabled={locale === 'en'}>
          {t('language_switcher.en')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLocale('ar')} disabled={locale === 'ar'}>
          {t('language_switcher.ar')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export default function LanguageSwitcher() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <Skeleton className="w-9 h-9 rounded-full" />;
    }

    return <LanguageSwitcherContent />;
}
