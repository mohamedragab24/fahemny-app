import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { I18nProviderClient } from "@/locales/client";
import { getI18n } from "@/locales/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-headline",
});

export const metadata: Metadata = {
  title: "كونكت ناو - ابحث عن المواهب والعمل",
  description: "منصة حديثة لربط أصحاب العمل والمستقلين.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = 'ar';
  const t = await getI18n();

  return (
    <html lang={locale} dir="rtl">
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
              <Header translations={t.header} />
              <main className="flex-grow">{children}</main>
              <Footer translations={t.footer} />
            </div>
            <Toaster />
          </FirebaseClientProvider>
        </I18nProviderClient>
      </body>
    </html>
  );
}
