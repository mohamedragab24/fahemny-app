"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  BrainCircuit,
  Menu,
  User,
  LogOut,
  ShieldCheck,
  LifeBuoy,
  Wallet,
  PlusCircle,
  LayoutGrid,
  Bell,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUser, useAuth, useDoc, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
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
import type { UserProfile, Notification } from "@/lib/types";
import { doc, collection, query, where, orderBy, limit } from "firebase/firestore";
import ar from "@/locales/ar";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { formatDistanceToNow } from 'date-fns';
import { ar as arLocale } from 'date-fns/locale';

type Translations = typeof ar.header;

export default function Header({ translations: t }: { translations: Translations}) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const t_notifications = ar.notifications;

  const userProfileRef = useMemoFirebase(
    () => user ? doc(firestore, 'userProfiles', user.uid) : null,
    [firestore, user]
  );
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const notificationsQuery = useMemoFirebase(
    () => user ? query(
        collection(firestore, 'notifications'), 
        where('userId', '==', user.uid), 
        orderBy('createdAt', 'desc'), 
        limit(10)
    ) : null,
    [firestore, user]
  );
  const { data: notifications } = useCollection<Notification>(notificationsQuery);
  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      const notifRef = doc(firestore, 'notifications', notification.id);
      updateDocumentNonBlocking(notifRef, { isRead: true });
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const navLinks = [
    { href: "/requests/browse", label: t.links.browse_requests },
    { href: "/requests/create", label: t.links.create_request },
    { href: "/sessions", label: t.links.my_sessions },
    { href: "/wallet", label: t.links.wallet },
    { href: "/support", label: t.links.support },
  ];
  
  const mobileNavLinks = [
      { href: "/requests/browse", label: t.links.browse_requests, icon: <LayoutGrid className="h-5 w-5" /> },
      { href: "/requests/create", label: t.links.create_request, icon: <PlusCircle className="h-5 w-5" /> },
      { href: "/sessions", label: t.links.my_sessions, icon: <BrainCircuit className="h-5 w-5" /> },
      { href: "/wallet", label: t.links.wallet, icon: <Wallet className="h-5 w-5" /> },
      { href: "/support", label: t.links.support, icon: <LifeBuoy className="h-5 w-5" /> },
  ];

  const getInitials = (name?: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.email?.[0].toUpperCase();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold font-headline text-lg">
            <BrainCircuit className="h-6 w-6 text-primary" />
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
            <div className="flex items-center space-x-2">
                <div className="h-9 w-9 bg-muted rounded-full animate-pulse" />
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
            </div>
          ) : user && userProfile ? (
            <>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full" size="icon">
                          <Bell className="h-5 w-5" />
                          {unreadCount > 0 && (
                              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                              </span>
                          )}
                          <span className="sr-only">{t_notifications.title}</span>
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 md:w-96">
                      <DropdownMenuLabel>{t_notifications.title}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {notifications && notifications.length > 0 ? (
                          <div className="max-h-80 overflow-y-auto">
                          {notifications.map(notification => (
                              <DropdownMenuItem 
                                  key={notification.id} 
                                  onClick={() => handleNotificationClick(notification)}
                                  className={`flex items-start gap-3 whitespace-normal cursor-pointer ${!notification.isRead ? 'bg-primary/5' : ''}`}
                              >
                                  <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${!notification.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                                  <div className="flex-1 space-y-1">
                                      <p className="font-semibold text-sm">{notification.title}</p>
                                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                                      <p className="text-xs text-muted-foreground/80">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: arLocale })}</p>
                                  </div>
                              </DropdownMenuItem>
                          ))}
                          </div>
                      ) : (
                          <p className="p-4 text-center text-sm text-muted-foreground">{t_notifications.no_notifications}</p>
                      )}
                  </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userProfile.photoURL || undefined} alt={userProfile.name} />
                      <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userProfile.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>{t.userMenu.profile}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/sessions')}>
                      <BrainCircuit className="mr-2 h-4 w-4" />
                      <span>{t.links.my_sessions}</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t.auth.logout}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
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
               <SheetTitle className="sr-only">{t.mobile.title}</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="border-b pb-4">
                  <Link href="/" className="flex items-center gap-2 font-bold font-headline text-lg">
                    <BrainCircuit className="h-6 w-6 text-primary" />
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
