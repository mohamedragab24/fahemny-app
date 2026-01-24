import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { I18nProviderClient } from "@/locales/client";
import { getI18n, getCurrentLocale } from "@/locales/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-headline",
});

export const metadata: Metadata = {
  title: "ConnectNow - Find Talent & Work",
  description: "A modern platform for connecting employers and freelancers.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = getCurrentLocale();
  const t = await getI18n();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body
        className={cn(
          "relative h-full font-sans antialiased",
          inter.variable,
          spaceGrotesk.variable
        )}
      >
        <I18nProviderClient locale={locale}>
          <FirebaseClientProvider>
            <div className="flex flex-col min-h-screen">
              <Header translations={{
                header: t('header'),
                language_switcher: t('language_switcher')
              }} />
              <main className="flex-grow">{children}</main>
              <Footer translations={{
                header: t('header'),
                footer: t('footer'),
              }} />
            </div>
            <Toaster />
          </FirebaseClientProvider>
        </I18nProviderClient>
      </body>
    </html>
  );
}
