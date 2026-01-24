import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.14))] flex-col items-center justify-center py-12 px-4">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2 font-bold font-headline text-2xl">
          <Briefcase className="h-8 w-8 text-primary" />
          <span>ConnectNow</span>
        </Link>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
