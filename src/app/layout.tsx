import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { I18nProviderClient } from "@/locales/client";
import { getStaticParams } from "@/locales/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-headline",
});

export function generateStaticParams() {
  return getStaticParams();
}

export const metadata: Metadata = {
  title: "ConnectNow - Find Talent & Work",
  description: "A modern platform for connecting employers and freelancers.",
};

export default function RootLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
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
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </FirebaseClientProvider>
        </I18nProviderClient>
      </body>
    </html>
  );
}
