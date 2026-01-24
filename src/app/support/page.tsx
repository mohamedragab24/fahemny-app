import ar from "@/locales/ar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SupportPage() {
    const t = ar.support_page;
    return (
        <div className="container mx-auto py-10">
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-headline">{t.title}</CardTitle>
                    <CardDescription>{t.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground">
                        يمكنك التواصل معنا عبر البريد الإلكتروني: support@connectnow.com
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
