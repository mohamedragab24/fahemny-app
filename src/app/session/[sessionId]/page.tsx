'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { SessionRequest, UserProfile } from '@/lib/types';
import { generateJitsiJwt, type GenerateJitsiJwtOutput } from '@/ai/flows/generate-jitsi-jwt';
import { doc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Loader2 } from 'lucide-react';
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
    const [isLoading, setIsLoading] = useState(true);

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
        let script: HTMLScriptElement | null = null;

        const loadJitsiScript = (scriptUrl: string): Promise<void> => {
            return new Promise((resolve, reject) => {
                if (window.JitsiMeetExternalAPI) {
                    return resolve();
                }
                script = document.createElement('script');
                script.src = scriptUrl;
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error('Failed to load Jitsi script.'));
                document.head.appendChild(script);
            });
        };

        const initializeJitsi = async () => {
             if (isUserLoading || isSessionLoading || isProfileLoading || !session || !userProfile || !user || jitsiApi) {
                return;
            }

            try {
                setIsLoading(true);
                const roomName = `Fahemny-Session-${sessionId}`; 
                const isModerator = user.uid === session.tutorId;

                const jitsiConfig: GenerateJitsiJwtOutput = await generateJitsiJwt({
                    roomName: roomName,
                    userId: user.uid,
                    userName: userProfile.name,
                    userEmail: userProfile.email,
                    isModerator: isModerator,
                });

                if (!jitsiConfig?.jwt || !jitsiConfig.scriptUrl) {
                    throw new Error("Failed to get session configuration from server.");
                }

                await loadJitsiScript(jitsiConfig.scriptUrl);

                if (typeof window.JitsiMeetExternalAPI === 'undefined') {
                    throw new Error("Jitsi API not found after loading script.");
                }

                const options = {
                    roomName: jitsiConfig.fullRoomName,
                    parentNode: jitsiContainerRef.current,
                    jwt: jitsiConfig.jwt,
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
                
                const api = new window.JitsiMeetExternalAPI(jitsiConfig.jitsiServer, options);
                api.on('iframeReady', () => setIsLoading(false));
                setJitsiApi(api);

            } catch (e: any) {
                console.error("Failed to initialize Jitsi:", e);
                setError(e.message || "Could not start video session.");
                setIsLoading(false);
            }
        };

        initializeJitsi();
        
        return () => {
            jitsiApi?.dispose();
            if (script && document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };

    }, [jitsiApi, session, userProfile, sessionId, user, isUserLoading, isSessionLoading, isProfileLoading]);
    
    if (isLoading || isUserLoading || isSessionLoading || isProfileLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background">
                 <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">جارٍ تحضير الجلسة...</p>
                 </div>
            </div>
        );
    }
    
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
    
    if (error) {
        const isConfigError = error.includes('Jitsi App ID or Private Key is not set');
        return (
             <div className="container mx-auto py-16 px-4">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                     <AlertTitle>
                         {isConfigError ? 'خطأ في إعدادات خدمة الفيديو' : 'خطأ في بدء الجلسة'}
                    </AlertTitle>
                    <AlertDescription>
                        {isConfigError ? (
                            <>
                                <p className="mb-2">يبدو أن بيانات الاعتماد لخدمة الفيديو (Jitsi/8x8) غير مكتملة في متغيرات البيئة.</p>
                                <p>هذه البيانات ضرورية لتأمين الجلسات. يرجى مراجعة ملف `.env.local` والتأكد من إضافة `JITSI_APP_ID` و `JITSI_PRIVATE_KEY` بشكل صحيح.</p>
                            </>
                        ) : (
                            <>
                                <p>لم نتمكن من بدء جلسة الفيديو. الرجاء المحاولة مرة أخرى لاحقًا.</p>
                                <p className="text-xs mt-4 font-mono">{error}</p>
                            </>
                        )}
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div id="jaas-container" ref={jitsiContainerRef} className="h-screen w-screen" />
    );
}
