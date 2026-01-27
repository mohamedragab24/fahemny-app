"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  BrainCircuit,
  Menu,
  User,
  LogOut,
  LifeBuoy,
  Wallet,
  PlusCircle,
  LayoutGrid,
  Bell,
  BellRing,
  Check,
  LayoutDashboard,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
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
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserProfile, Notification } from "@/lib/types";
import { doc, collection, query, where, limit, updateDoc, orderBy } from "firebase/firestore";
import ar from "@/locales/ar";
import { cn } from "@/lib/utils";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { ar as arLocale } from "date-fns/locale";

type Translations = typeof ar.header;

function NotificationsDropdown() {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const notificationsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(
            collection(firestore, 'notifications'),
            where('userId', '==', user.uid),
            limit(10)
        );
    }, [firestore, user]);

    const { data: rawNotifications } = useCollection<Notification>(notificationsQuery);

    const sortedNotifications = useMemo(() => {
        return rawNotifications?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];
    }, [rawNotifications]);

    const unreadCount = useMemo(() => {
        return rawNotifications?.filter(n => !n.isRead).length || 0;
    }, [rawNotifications]);

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            const notifRef = doc(firestore, 'notifications', notification.id);
            updateDoc(notifRef, { isRead: true });
        }
        if (notification.link) {
            router.push(notification.link);
        }
    };

    const markAllAsRead = () => {
        if (!rawNotifications) return;
        rawNotifications.forEach(notification => {
            if (!notification.isRead) {
                const notifRef = doc(firestore, 'notifications', notification.id);
                updateDocumentNonBlocking(notifRef, { isRead: true });
            }
        });
    };
    
    if (!user) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                    {unreadCount > 0 ? <BellRing className="h-5 w-5 text-primary" /> : <Bell className="h-5 w-5" />}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-white">
                            {unreadCount}
                        </span>
                    )}
                    <span className="sr-only">{ar.notifications.title}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <span>{ar.notifications.title}</span>
                    {unreadCount > 0 && (
                         <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto px-2 py-1 text-xs">
                            <Check className="me-1 h-3 w-3" />
                            وضع علامة "مقروء" على الكل
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {sortedNotifications.length > 0 ? (
                        sortedNotifications.map(notification => (
                            <DropdownMenuItem 
                                key={notification.id} 
                                className={cn("flex flex-col items-start gap-1 whitespace-normal cursor-pointer", !notification.isRead && "bg-primary/5")}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <p className="font-semibold text-sm">{notification.title}</p>
                                <p className="text-xs text-muted-foreground">{notification.message}</p>
                                <p className="text-xs text-muted-foreground/80 self-end">
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: arLocale })}
                                </p>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                            {ar.notifications.no_notifications}
                        </div>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/notifications')} className="justify-center">
                    <span className="text-sm font-medium">{ar.notifications.view_all}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

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
    { href: "/requests/browse", label: t.links.browse_requests, role: 'tutor' },
    { href: "/requests/create", label: t.links.create_request, role: 'student' },
    { href: "/sessions", label: t.links.my_sessions },
    { href: "/wallet", label: t.links.wallet },
  ];
  
  const mobileNavLinks = [
      { href: "/requests/browse", label: t.links.browse_requests, icon: <LayoutGrid className="h-5 w-5" />, role: 'tutor' },
      { href: "/requests/create", label: t.links.create_request, icon: <PlusCircle className="h-5 w-5" />, role: 'student' },
      { href: "/sessions", label: t.links.my_sessions, icon: <BrainCircuit className="h-5 w-5" /> },
      { href: "/wallet", label: t.links.wallet, icon: <Wallet className="h-5 w-5" /> },
      { href: "/notifications", label: ar.notifications.title, icon: <Bell className="h-5 w-5" /> },
      { href: "/support", label: t.links.support, icon: <LifeBuoy className="h-5 w-5" /> },
  ];

  const getInitials = (name?: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.email?.[0].toUpperCase();
  }

  const userNavLinks = navLinks.filter(link => !link.role || link.role === userProfile?.role);
  const userMobileNavLinks = mobileNavLinks.filter(link => !link.role || link.role === userProfile?.role);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold font-headline text-lg">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span>{t.title}</span>
          </Link>
        </div>
        
        {user && userProfile && (
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {userNavLinks.map((link) => (
                <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                {link.label}
                </Link>
            ))}
            </nav>
        )}

        <div className="flex flex-1 items-center justify-end space-x-2">
          {isUserLoading ? (
            <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />
          ) : user && userProfile ? (
            <>
              <NotificationsDropdown />
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
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>{t.userMenu.profile}</span>
                    </DropdownMenuItem>
                     {userProfile.isAdmin && (
                        <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>{t.links.admin_dashboard}</span>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => router.push('/sessions')}>
                        <BrainCircuit className="mr-2 h-4 w-4" />
                        <span>{t.links.my_sessions}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/wallet')}>
                        <Wallet className="mr-2 h-4 w-4" />
                        <span>{t.links.wallet}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/notifications')}>
                        <Bell className="mr-2 h-4 w-4" />
                        <span>{ar.notifications.title}</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
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
                <SheetHeader>
                    <SheetTitle className="sr-only">{t.mobile.title}</SheetTitle>
                    <SheetDescription className="sr-only">{t.mobile.description}</SheetDescription>
                </SheetHeader>
              <div className="flex flex-col h-full">
                <div className="border-b pb-4">
                  <Link href="/" className="flex items-center gap-2 font-bold font-headline text-lg">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                    <span>{t.title}</span>
                  </Link>
                </div>
                <nav className="flex-grow mt-6">
                  <ul className="space-y-4">
                    {user && userProfile ? userMobileNavLinks.map((link) => (
                      <li key={link.href}>
                        <SheetClose asChild>
                         <Link href={link.href} className="flex items-center gap-3 text-lg font-medium">
                           {link.icon}
                           {link.label}
                         </Link>
                        </SheetClose>
                      </li>
                    )) : (
                        <li>
                            <SheetClose asChild>
                                <Link href="/about" className="flex items-center gap-3 text-lg font-medium">
                                    <LifeBuoy className="h-5 w-5" />
                                    <span>{ar.footer.about}</span>
                                </Link>
                            </SheetClose>
                        </li>
                    )}
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
