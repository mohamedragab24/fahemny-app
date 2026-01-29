import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import ar from "@/locales/ar";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "FAHEMNY - فَهِّمْني",
  description: "فَهِّمْني – كل الفهم... من مكان واحد",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = 'ar';

  return (
    <html lang={locale} dir="rtl">
      <body
        className={cn(
          "relative h-full font-body antialiased",
          cairo.variable
        )}
      >
        <FirebaseClientProvider>
          <div className="flex flex-col min-h-screen">
            <Header translations={ar.header} />
            <main className="flex-grow">{children}</main>
            <Footer translations={ar.footer} />
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
