"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, Menu, MessageSquare } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/projects", label: "Projects", icon: <Briefcase className="h-5 w-5" /> },
  { href: "/dashboard", label: "Dashboard", icon: <Briefcase className="h-5 w-5" /> },
  { href: "/messages", label: "Messages", icon: <MessageSquare className="h-5 w-5" /> },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold font-headline text-lg">
            <Briefcase className="h-6 w-6 text-primary" />
            <span>ConnectNow</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
           <div className="hidden md:flex items-center space-x-2">
            <Link href="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
           </div>
           <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col h-full">
                <div className="border-b pb-4">
                  <Link href="/" className="flex items-center gap-2 font-bold font-headline text-lg">
                     <Briefcase className="h-6 w-6 text-primary" />
                     <span>ConnectNow</span>
                  </Link>
                </div>
                <nav className="flex-grow mt-6">
                  <ul className="space-y-4">
                    {navLinks.map((link) => (
                      <li key={link.href}>
                         <Link href={link.href} className="flex items-center gap-3 text-lg font-medium">
                           {link.icon}
                           {link.label}
                         </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="mt-auto border-t pt-4">
                    <div className="flex flex-col space-y-2">
                      <Link href="/login">
                        <Button variant="ghost" className="w-full">Log In</Button>
                      </Link>
                      <Link href="/register">
                        <Button className="w-full">Sign Up</Button>
                      </Link>
                    </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
