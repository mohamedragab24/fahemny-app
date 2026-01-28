'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { UserProfile, SessionRequest, Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, BookOpen, Banknote, Activity } from 'lucide-react';
import ar from '@/locales/ar';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Pie, PieChart, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

export default function AdminDashboardPage() {
  const t = ar.admin.dashboard;
  const firestore = useFirestore();

  // Fetch data from the last 30 days for performance
  const thirtyDaysAgo = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString();
  }, []);

  const usersQuery = useMemoFirebase(() => query(collection(firestore, 'userProfiles'), where('createdAt', '>', thirtyDaysAgo)), [firestore, thirtyDaysAgo]);
  const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);
  
  const sessionsQuery = useMemoFirebase(() => query(collection(firestore, 'sessionRequests'), where('createdAt', '>', thirtyDaysAgo)), [firestore, thirtyDaysAgo]);
  const { data: sessions, isLoading: isLoadingSessions } = useCollection<SessionRequest>(sessionsQuery);

  const transactionsQuery = useMemoFirebase(() => query(collection(firestore, 'transactions'), where('createdAt', '>', thirtyDaysAgo)), [firestore, thirtyDaysAgo]);
  const { data: transactions, isLoading: isLoadingTransactions } = useCollection<Transaction>(transactionsQuery);

  const isLoading = isLoadingUsers || isLoadingSessions || isLoadingTransactions;

  // Memoize processed data for charts
  const { stats, sessionStatusData, userGrowthData } = useMemo(() => {
    if (!users || !sessions || !transactions) {
      return { stats: {}, sessionStatusData: [], userGrowthData: [] };
    }

    // Key Stats for the last 30 days
    const newUsers = users.length;
    const newSessions = sessions.length;
    
    const platformRevenue = transactions
      .filter(tx => tx.type === 'session_payment')
      .reduce((acc, tx) => acc + Math.abs(tx.amount) * 0.20, 0);

    // Session Status Distribution for new sessions
    const statusCounts = sessions.reduce((acc, session) => {
      acc[session.status] = (acc[session.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sessionStatusData = [
      { name: 'مفتوحة', value: statusCounts.open || 0, fill: 'hsl(var(--chart-2))' },
      { name: 'مقبولة', value: statusCounts.accepted || 0, fill: 'hsl(var(--chart-1))' },
      { name: 'مكتملة', value: statusCounts.completed || 0, fill: 'hsl(var(--chart-3))' },
      { name: 'ملغاة', value: statusCounts.cancelled || 0, fill: 'hsl(var(--chart-5))' },
    ];
    
    // User Growth Over Time for the last 30 days
    const userGrowthCounts = users.reduce((acc, user) => {
        const date = new Date(user.createdAt).toLocaleDateString('en-CA'); // YYYY-MM-DD
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    const userGrowthData = Object.keys(userGrowthCounts)
      .sort((a,b) => new Date(a).getTime() - new Date(b).getTime())
      .map(date => ({ date: new Date(date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }), users: userGrowthCounts[date] }));


    return {
      stats: { newUsers, newSessions, platformRevenue },
      sessionStatusData,
      userGrowthData,
    };

  }, [users, sessions, transactions]);

  if (isLoading) {
    return (
        <div>
            <h1 className="text-3xl font-bold font-headline mb-6"><Skeleton className="h-8 w-48" /></h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-10 w-1/2" /></CardContent></Card>
                ))}
            </div>
             <div className="grid gap-4 mt-8 md:grid-cols-2">
                <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
            </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t.new_users_30_days}</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.newUsers}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t.new_sessions_30_days}</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.newSessions}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t.revenue_30_days}</CardTitle>
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.platformRevenue?.toFixed(2) || '0.00'} <span className="text-sm text-muted-foreground">جنيه</span></div>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>{t.user_growth}</CardTitle>
                    <CardDescription>عدد المستخدمين الجدد المسجلين بمرور الوقت.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{}} className="h-[250px] w-full">
                         <BarChart accessibilityLayer data={userGrowthData}>
                             <CartesianGrid vertical={false} />
                            <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                             <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="users" fill="hsl(var(--primary))" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>{t.session_status_distribution}</CardTitle>
                     <CardDescription>توزيع حالات الجلسات الجديدة في آخر 30 يوم.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <ChartContainer config={{}} className="h-[250px] w-full max-w-xs">
                        <PieChart>
                             <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                            <Pie data={sessionStatusData} dataKey="value" nameKey="name" innerRadius={50}>
                                {sessionStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                             <ChartLegend content={<ChartLegendContent />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>

    </div>
  );
}
