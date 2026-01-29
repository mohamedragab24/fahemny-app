# مشروع فَهِّمْني

"فَهِّمْني" هي منصة تعليمية آمنة تربط بين "المستفهمين" (الطلاب) و"المفهّمين" (المعلمون الخبراء) لجلسات شرح سريعة وفردية عبر الفيديو.

## التقنيات المستخدمة

- Next.js & React
- TypeScript
- Tailwind CSS & ShadCN/UI
- Firebase (Firestore, Auth, Storage)
- Genkit & Jitsi

---

## كيفية الإعداد والتشغيل

### 1. المتطلبات الأساسية
- Node.js
- حساب Firebase

### 2. تثبيت الحزم
```bash
npm install
```

### 3. إعداد متغيرات البيئة (مهم جدًا لجلسات الفيديو)
- أنشئ حسابًا على [8x8 JaaS](https://jaas.8x8.vc/).
- انسخ `App ID` و `Private Key`.
- أنشئ ملف `.env.local` في جذر المشروع وأضف:
```
JITSI_APP_ID="YOUR_APP_ID"
JITSI_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
```

### 4. تشغيل المشروع
```bash
npm run dev
```
التطبيق سيعمل على `http://localhost:9002`.
