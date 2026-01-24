'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  collection,
  doc,
  query,
  where,
} from 'firebase/firestore';
import {
  useCollection,
  useDoc,
  useFirestore,
  useMemoFirebase,
  useUser,
} from '@/firebase';
import { CheckCircle, Clock, DollarSign, User, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Offer, Project, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import ar from '@/locales/ar';

function ProjectProposals({ project }: { project: Project }) {
  const t = ar.project_details;
  const { user } = useUser();
  const firestore = useFirestore();

  const offersQuery = useMemoFirebase(
    () =>
      project.id
        ? query(collection(firestore, 'offers'), where('projectId', '==', project.id))
        : null,
    [firestore, project.id]
  );

  const { data: offers, isLoading } = useCollection<Offer>(offersQuery);
  
  if (user?.uid !== project.employerId) return null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-grow space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
     <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t.proposals} ({offers?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!offers || offers.length === 0 ? (
           <p className="text-muted-foreground">{t.no_proposals}</p>
        ) : (
          offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function OfferCard({ offer }: { offer: Offer }) {
  const t = ar.user_types;
  const firestore = useFirestore();
  const freelancerRef = useMemoFirebase(
    () => doc(firestore, 'userProfiles', offer.freelancerId),
    [firestore, offer.freelancerId]
  );
  const { data: freelancer, isLoading } = useDoc<UserProfile>(freelancerRef);
  
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  }

  if (isLoading || !freelancer) {
    return (
        <div className="flex gap-4 p-4 border rounded-lg">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-grow space-y-2">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-16 w-full" />
            </div>
        </div>
    )
  }
  
  return (
     <div className="flex gap-4 p-4 border rounded-lg bg-secondary/30">
        <Avatar className='h-12 w-12'>
            <AvatarImage src={freelancer.photoURL} />
            <AvatarFallback>{getInitials(freelancer.firstName, freelancer.lastName)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg">{freelancer.firstName} {freelancer.lastName}</p>
                    {freelancer.isVerified && <CheckCircle className="h-4 w-4 text-primary" />}
                </div>
                <div className="text-right">
                    <p className="font-bold text-xl text-primary">${offer.rate}</p>
                    {offer.createdAt && <p className="text-sm text-muted-foreground">{new Date(offer.createdAt).toLocaleDateString()}</p>}
                </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{t[freelancer.userType]}</p>
            <p className="text-muted-foreground mt-4 whitespace-pre-wrap">{offer.description}</p>
        </div>
    </div>
  )
}

function EmployerCard({ employerId }: { employerId: string }) {
  const t = ar.project_details;
  const firestore = useFirestore();
  const employerRef = useMemoFirebase(
    () => doc(firestore, 'userProfiles', employerId),
    [firestore, employerId]
  );
  const { data: employer, isLoading } = useDoc<UserProfile>(employerRef);
  
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  }

  if (isLoading || !employer) {
    return <Skeleton className="h-24 w-full" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t.about_employer}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={employer.photoURL} />
            <AvatarFallback>{getInitials(employer.firstName, employer.lastName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{employer.firstName} {employer.lastName}</p>
            {employer.isVerified && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>{t.verified}</span>
              </div>
            )}
          </div>
        </div>
        <Button className="w-full">{t.view_profile}</Button>
      </CardContent>
    </Card>
  );
}

const proposalSchema = z.object({
  rate: z.coerce.number().min(1, "السعر مطلوب"),
  description: z.string().min(10, "رسالة التغطية يجب أن تكون 10 أحرف على الأقل"),
});

function ProposalForm({ project }: { project: Project }) {
  const t = ar.project_details;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const userProfileRef = useMemoFirebase(
    () => user ? doc(firestore, 'userProfiles', user.uid) : null,
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const offersQuery = useMemoFirebase(
      () => user ? query(collection(firestore, 'offers'), where('projectId', '==', project.id), where('freelancerId', '==', user.uid)) : null,
      [firestore, user, project.id]
  );
  const {data: existingOffers, isLoading: isOffersLoading} = useCollection<Offer>(offersQuery);

  const form = useForm<z.infer<typeof proposalSchema>>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      rate: undefined,
      description: ""
    }
  });
  
  const { formState: {isSubmitting} } = form;
  
  const isLoading = isUserLoading || isProfileLoading || isOffersLoading;

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />
  }
  
  // Hide form if user is the project employer
  if (user?.uid === project.employerId) {
      return null;
  }
  
  // Prompt to log in if not logged in
  if (!user || !userProfile) {
    return (
        <Card className='text-center p-8'>
            <p className='text-muted-foreground'>{t.login_prompt} <Link href="/login" className="underline font-semibold text-primary">{ar.header.auth.login}</Link></p>
        </Card>
    )
  }
  
  // Show message if user is not a freelancer
  if (userProfile.userType !== 'freelancer') {
      return (
          <Card className='text-center p-8'>
            <p className='text-muted-foreground'>يجب أن تكون مستقلاً لتقديم عرض.</p>
        </Card>
      )
  }

  // Show message if freelancer has already submitted a proposal
  if (existingOffers && existingOffers.length > 0) {
      return (
          <Card className='p-6'>
            <CardTitle className='mb-4 font-headline'>تم تقديم عرضك</CardTitle>
            <OfferCard offer={existingOffers[0]} />
        </Card>
      )
  }

  async function onSubmit(values: z.infer<typeof proposalSchema>) {
    if (!user) return;

    const offerData = {
        projectId: project.id,
        freelancerId: user.uid,
        rate: values.rate,
        description: values.description,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    
    const offersCollection = collection(firestore, 'offers');
    addDocumentNonBlocking(offersCollection, offerData);
    
    toast({
        title: "تم تقديم العرض!",
        description: "تم إرسال عرضك إلى صاحب العمل.",
    });
    form.reset();
  }

  return (
     <Card>
        <CardHeader>
          <CardTitle className="font-headline">{t.submit_proposal_title}</CardTitle>
        </CardHeader>
        <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="rate">{t.rate_label}</Label>
            <Input id="rate" type="number" placeholder={t.rate_placeholder} className="max-w-xs" {...form.register("rate")} />
            {form.formState.errors.rate && <p className="text-sm text-destructive">{form.formState.errors.rate.message}</p>}
          </div>
          <div className="space-y-1">
             <Label htmlFor="cover-letter">{t.cover_letter_label}</Label>
            <Textarea id="cover-letter" placeholder={t.cover_letter_placeholder} className="min-h-[150px]" {...form.register("description")} />
            {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
          </div>
          <Button size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? t.submitting_button : t.submit_button}
          </Button>
        </form>
        </CardContent>
      </Card>
  )
}

export default function ProjectDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const t = ar.project_details;
  const firestore = useFirestore();
  const projectRef = useMemoFirebase(
    () => doc(firestore, 'projects', params.id),
    [firestore, params.id]
  );
  const { data: project, isLoading } = useDoc<Project>(projectRef);
  
  const offersQuery = useMemoFirebase(
      () => params.id ? query(collection(firestore, 'offers'), where('projectId', '==', params.id)) : null,
      [firestore, params.id]
  );
  const { data: offers, isLoading: offersLoading } = useCollection(offersQuery);
  
  const projectImagePlaceholder = PlaceHolderImages.find(
    (p) => p.id === 'project-detail-image'
  );

  if (isLoading || offersLoading) {
    return (
      <div className="container mx-auto py-10">
         <Skeleton className="h-screen w-full" />
      </div>
    );
  }

  if (!project) {
    notFound();
  }
  
  const imageUrl = project.imageUrl || projectImagePlaceholder?.imageUrl;

  return (
    <div className="container mx-auto py-10">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-headline">
                {project.title}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {t.deadline}{' '}
                    {project.deadline}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{offers?.length || 0} {t.proposals}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {imageUrl && (
                <div className="mb-6">
                  <Image
                    src={imageUrl}
                    width={800}
                    height={400}
                    alt={project.title}
                    data-ai-hint={!project.imageUrl ? projectImagePlaceholder?.imageHint : 'project image'}
                    className="rounded-lg object-cover w-full aspect-video"
                  />
                </div>
              )}
              <h3 className="font-semibold text-lg mb-2">
                {ar.create_project.project_description_label}
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {project.description}
              </p>
              {project.tags && project.tags.length > 0 && <>
                <Separator className="my-6" />
                <h3 className="font-semibold text-lg mb-4">{ar.create_project.tags_label}</h3>
                <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                        {tag}
                    </Badge>
                    ))}
                </div>
              </>}
            </CardContent>
          </Card>

          <ProposalForm project={project} />

          <ProjectProposals project={project} />

        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t.project_budget}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${project.budget}
              </div>
              <p className="text-xs text-muted-foreground">{t.fixed_price}</p>
            </CardContent>
          </Card>
          
          {project.employerId && <EmployerCard employerId={project.employerId} />}

        </div>
      </div>
    </div>
  );
}
