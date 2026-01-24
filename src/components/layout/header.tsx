"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Menu,
  MessageSquare,
  User,
  LogOut,
  ShieldCheck,
  LifeBuoy,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUser, useAuth, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserProfile } from "@/lib/types";
import { doc } from "firebase/firestore";
import ar from "@/locales/ar";

type Translations = typeof ar.header;

export default function Header({ translations: t }: { translations: Translations}) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const userProfileRef = useMemoFirebase(
    () => user ? doc(firestore, 'userProfiles', user.uid) : null,
    [firestore, user]
  );
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const navLinks = [
    { href: "/projects", label: t.links.projects },
    { href: "/dashboard", label: t.links.dashboard },
    { href: "/messages", label: t.links.messages },
    { href: "/support", label: t.links.support },
  ];
  
  const mobileNavLinks = [
      { href: "/projects", label: t.links.projects, icon: <Briefcase className="h-5 w-5" /> },
      { href: "/dashboard", label: t.links.dashboard, icon: <User className="h-5 w-5" /> },
      { href: "/messages", label: t.links.messages, icon: <MessageSquare className="h-5 w-5" /> },
      { href: "/support", label: t.links.support, icon: <LifeBuoy className="h-5 w-5" /> },
  ];

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || user?.email?.[0].toUpperCase();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold font-headline text-lg">
            <Briefcase className="h-6 w-6 text-primary" />
            <span>{t.title}</span>
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
          {isUserLoading ? (
            <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />
          ) : user && userProfile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile.photoURL || undefined} alt={`${userProfile.firstName} ${userProfile.lastName}`} />
                    <AvatarFallback>{getInitials(userProfile.firstName, userProfile.lastName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile.firstName} {userProfile.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>{t.userMenu.dashboard}</span>
                </DropdownMenuItem>
                {userProfile.isAdmin && (
                  <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    <span>{t.links.admin_dashboard}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t.auth.logout}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost">{t.auth.login}</Button>
              </Link>
              <Link href="/register">
                <Button>{t.auth.signup}</Button>
              </Link>
            </div>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t.mobile.toggle}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetTitle className="sr-only">{t.mobile.toggle}</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="border-b pb-4">
                  <Link href="/" className="flex items-center gap-2 font-bold font-headline text-lg">
                    <Briefcase className="h-6 w-6 text-primary" />
                    <span>{t.title}</span>
                  </Link>
                </div>
                <nav className="flex-grow mt-6">
                  <ul className="space-y-4">
                    {mobileNavLinks.map((link) => (
                      <li key={link.href}>
                        <SheetClose asChild>
                         <Link href={link.href} className="flex items-center gap-3 text-lg font-medium">
                           {link.icon}
                           {link.label}
                         </Link>
                        </SheetClose>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="mt-auto border-t pt-4">
                  {user ? (
                      <Button onClick={handleSignOut} className="w-full">{t.auth.logout}</Button>
                  ) : (
                    <div className="flex flex-col space-y-2">
                        <SheetClose asChild>
                            <Link href="/login">
                                <Button variant="ghost" className="w-full">{t.auth.login}</Button>
                            </Link>
                        </SheetClose>
                        <SheetClose asChild>
                            <Link href="/register">
                                <Button className="w-full">{t.auth.signup}</Button>
                            </Link>
                        </SheetClose>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
