'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { SessionRequest, UserProfile } from '@/lib/types';
import { generateJitsiJwt } from '@/ai/flows/generate-jitsi-jwt';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import ar from '@/locales/ar';

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

export default function SessionPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const [jitsiApi, setJitsiApi] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const sessionRef = useMemoFirebase(
        () => (firestore && sessionId ? doc(firestore, 'sessionRequests', sessionId) : null),
        [firestore, sessionId]
    );
    const { data: session, isLoading: isSessionLoading } = useDoc<SessionRequest>(sessionRef);

    const userProfileRef = useMemoFirebase(
        () => (user ? doc(firestore, 'userProfiles', user.uid) : null),
        [firestore, user]
    );
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    useEffect(() => {
        // Function to load the Jitsi script
        const loadJitsiScript = () => {
            if (window.JitsiMeetExternalAPI) {
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://8x8.vc/vpaas-magic-cookie-1fbd16d85bf84be0aaba7317c17f25dd/external_api.js';
            script.async = true;
            document.head.appendChild(script);
        };
        
        loadJitsiScript();
        
        // Cleanup function for when the component unmounts
        return () => {
            jitsiApi?.dispose();
        };
    }, [jitsiApi]);


    useEffect(() => {
        if (jitsiApi || !session || !userProfile || typeof window.JitsiMeetExternalAPI === 'undefined') {
            return;
        }

        const initializeJitsi = async () => {
            try {
                const roomName = `vpaas-magic-cookie-1fbd16d85bf84be0aaba7317c17f25dd/FahemnySession-${sessionId}`;
                const isModerator = user.uid === session.tutorId;

                const jwt = await generateJitsiJwt({
                    roomName: roomName,
                    userId: user.uid,
                    userName: userProfile.name,
                    userEmail: userProfile.email,
                    isModerator: isModerator,
                });
                
                if (!jwt) {
                    throw new Error("Failed to generate session token.");
                }

                const options = {
                    roomName: roomName,
                    parentNode: jitsiContainerRef.current,
                    jwt: jwt,
                    height: '100%',
                    width: '100%',
                    configOverwrite: {
                        startWithAudioMuted: true,
                        startWithVideoMuted: true,
                        prejoinPageEnabled: true,
                    },
                    interfaceConfigOverwrite: {
                        SHOW_JITSI_WATERMARK: false,
                        SHOW_WATERMARK_FOR_GUESTS: false,
                        TOOLBAR_BUTTONS: [
                            'microphone', 'camera', 'desktop', 'fullscreen',
                            'fodeviceselection', 'hangup', 'profile', 'chat',
                            'recording', 'livestreaming', 'etherpad', 'sharedvideo',
                            'settings', 'raisehand', 'videoquality', 'filmstrip',
                            'feedback', 'stats', 'shortcuts', 'tileview', 'videobackgroundblur',
                            'download', 'help', 'mute-everyone', 'e2ee'
                        ],
                    },
                };
                
                const api = new window.JitsiMeetExternalAPI("8x8.vc", options);
                setJitsiApi(api);

            } catch (e: any) {
                console.error("Failed to initialize Jitsi:", e);
                setError(e.message || "Could not start video session.");
            }
        };

        const script = document.querySelector('script[src="https://8x8.vc/vpaas-magic-cookie-1fbd16d85bf84be0aaba7317c17f25dd/external_api.js"]');
        if (script) {
            script.onload = initializeJitsi;
        } else {
            initializeJitsi();
        }

    }, [jitsiApi, session, userProfile, sessionId, user]);

    if (isUserLoading || isSessionLoading || isProfileLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <Skeleton className="h-full w-full" />
            </div>
        );
    }
    
    if (error) {
        return (
             <div className="container mx-auto py-16 px-4">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>خطأ في بدء الجلسة</AlertTitle>
                    <AlertDescription>
                        <p>لم نتمكن من بدء جلسة الفيديو. الرجاء المحاولة مرة أخرى لاحقًا.</p>
                         <p className="text-xs mt-4 font-mono">{error}</p>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    // Check if current user is part of the session
    if (user && session && user.uid !== session.studentId && user.uid !== session.tutorId) {
        return (
             <div className="container mx-auto py-16 px-4">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>غير مصرح لك بالدخول</AlertTitle>
                    <AlertDescription>
                        هذه الجلسة خاصة بالمشاركين فيها فقط.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return <div id="jaas-container" ref={jitsiContainerRef} className="h-screen w-screen" />;
}
