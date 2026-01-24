export default {
  header: {
    title: 'فَهِّمْني',
    links: {
      browse_requests: 'تصفح الطلبات',
      create_request: 'اطلب شرح',
      my_sessions: 'جلساتي',
      wallet: 'المحفظة',
      support: 'الدعم',
      admin_dashboard: 'لوحة التحكم',
    },
    auth: {
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      logout: 'تسجيل الخروج',
    },
    userMenu: {
      profile: 'ملفي الشخصي',
    },
    mobile: {
      toggle: 'فتح القائمة',
      title: 'القائمة الرئيسية',
    }
  },
  footer: {
    about: 'عن فَهِّمْني',
    contact: 'اتصل بنا',
    terms: 'شروط الخدمة',
    privacy: 'سياسة الخصوصية',
    rights: 'جميع الحقوق محفوظة.',
  },
  home: {
    hero: {
      title: 'اسأل… وهنفهمك فورًا',
      subtitle: 'أكبر منصة للمُفهّمين الخصوصيين. اطلب شرح لأي شيء، وفي أي وقت، وسيصلك بمُفهّم خبير فورًا.',
      cta_button: 'ابدأ الآن',
    },
    features: {
      heading: 'كيف يعمل',
      title: 'بثلاث خطوات بسيطة',
      ask: {
        title: 'اطلب شرح',
        description: 'اكتب طلبك بالتفصيل، حدد السعر المناسب لك، وانشره ليصل لآلاف المفهمين.',
      },
      choose: {
        title: 'اختر مفهّم',
        description: 'استقبل عروض من أفضل المفهمين، اختر الأنسب لك بناءً على تقييمه وخبرته.',
      },
      pay: {
        title: 'ادفع بأمان',
        description: 'ادفع بأمان عبر المنصة. يتم حجز المبلغ حتى انتهاء الجلسة ورضاك التام.',
      },
    },
    cta: {
      title: 'جاهز تفهم؟ أو تفهّم؟',
      subtitle: 'انضم لمجتمعنا الآن وابدأ رحلتك في عالم المعرفة.',
      signup_button: 'أنشئ حسابًا مجانيًا',
    },
  },
  login: {
    title: 'أهلاً بعودتك',
    description: 'سجل دخولك للمتابعة',
    email_label: 'البريد الإلكتروني',
    email_placeholder: 'email@example.com',
    password_label: 'كلمة المرور',
    submit_button: 'تسجيل الدخول',
    submitting_button: 'جارٍ الدخول...',
    signup_link_text: 'ليس لديك حساب؟',
    signup_link: 'أنشئ حسابًا',
  },
  register: {
    title: 'أنشئ حسابًا جديدًا',
    description: 'خطوات بسيطة تفصلك عن عالم من المعرفة.',
    name_label: 'الاسم الكامل',
    name_placeholder: 'مثال: محمد أحمد',
    email_label: 'البريد الإلكتروني',
    email_placeholder: 'email@example.com',
    password_label: 'كلمة المرور',
    submit_button: 'إنشاء حساب',
    submitting_button: 'جارٍ الإنشاء...',
    login_link_text: 'لديك حساب بالفعل؟',
    login_link: 'سجل الدخول',
  },
  select_role: {
    title: 'اختر دورك',
    description: 'حدد كيف ستستخدم فَهِّمْني. يمكنك تغيير هذا لاحقًا.',
    student: {
      title: 'أنا مستفهم',
      description: 'أريد أن أطلب شرحًا لمواضيع مختلفة.',
    },
    tutor: {
      title: 'أنا مفهّم',
      description: 'أريد أن أقدم شروحات وأكسب المال.',
    },
    submit_button: 'تأكيد',
  },
} as const;
