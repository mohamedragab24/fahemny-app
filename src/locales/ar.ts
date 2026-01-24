export default {
  header: {
    title: 'كونكت ناو',
    links: {
      projects: 'المشاريع',
      dashboard: 'لوحة التحكم',
      messages: 'الرسائل',
    },
    auth: {
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      logout: 'تسجيل الخروج',
    },
    userMenu: {
      dashboard: 'لوحة التحكم',
    },
    mobile: {
      toggle: 'تبديل القائمة',
    }
  },
  footer: {
    about: 'من نحن',
    contact: 'اتصل بنا',
    terms: 'شروط الخدمة',
    privacy: 'سياسة الخصوصية',
    rights: 'كل الحقوق محفوظة.',
  },
  home: {
    hero: {
      title: 'كونكت ناو: حيث تلتقي الرؤية بالموهبة',
      subtitle: 'المنصة المثالية للشركات للتواصل مع المستقلين المهرة. انشر المشاريع، واحصل على عروض، وأنجز أعمالك.',
      post_project: 'انشر مشروعًا',
      browse_projects: 'تصفح المشاريع',
    },
    features: {
      heading: 'الميزات الرئيسية',
      title: 'كل ما تحتاجه للنجاح',
      subtitle: 'توفر كونكت ناو بيئة سلسة وآمنة لأصحاب العمل والمستقلين على حد سواء لتحقيق النجاح.',
      talent: {
        title: 'ابحث عن الموهبة المثالية',
        description: 'انشر وظيفة واحصل على عروض من المستقلين الموهوبين في دقائق.',
      },
      payment: {
        title: 'سعر ثابت أو بالساعة',
        description: 'اختر طريقة الدفع التي تفضلها، مع مدفوعات آمنة وتتبع للإنجازات.',
      },
      collaboration: {
        title: 'تعاون بسهولة',
        description: 'استخدم منصتنا للدردشة ومشاركة الملفات وتتبع تقدم المشروع.',
      },
      find_work: {
        title: 'ابحث عن مشروعك القادم',
        description: 'تصفح آلاف المشاريع وابحث عن عمل يتناسب مع مهاراتك.',
      },
    },
    how_it_works: {
      title: 'كيف تعمل المنصة',
      subtitle: 'البدء بسيط. اتبع هذه الخطوات الثلاث السهلة.',
      step1: {
        title: 'انشر وظيفة',
        description: 'صف مشروعك، حدد ميزانيتك، وانشره لمجتمعنا من المستقلين.',
      },
      step2: {
        title: 'وظّف مستقلًا',
        description: 'راجع العروض، تحقق من الملفات الشخصية والأعمال السابقة، ووظف المرشح المثالي لعملك.',
      },
      step3: {
        title: 'أنجز العمل',
        description: 'تعاون مع المستقل، ادفع بأمان من خلال منصتنا، ووافق على العمل النهائي.',
      },
    },
    cta: {
      title: 'هل أنت مستعد لتحويل أفكارك إلى حقيقة؟',
      subtitle: 'انضم إلى كونكت ناو اليوم وابدأ رحلتك نحو النجاح، سواء كنت تبحث عن مواهب أو تسعى لفرص جديدة.',
      signup: 'أنشئ حسابًا مجانيًا',
    },
  },
  login: {
    title: 'مرحبًا بعودتك',
    description: 'أدخل بريدك الإلكتروني أدناه لتسجيل الدخول إلى حسابك',
    email_label: 'البريد الإلكتروني',
    email_placeholder: 'm@example.com',
    password_label: 'كلمة المرور',
    submit_button: 'تسجيل الدخول',
    submitting_button: 'جارٍ تسجيل الدخول...',
    signup_link_text: 'ليس لديك حساب؟',
    signup_link: 'إنشاء حساب',
  },
  register: {
    title: 'إنشاء حساب جديد',
    description: 'انضم إلى كونكت ناو للعثور على عمل أو توظيف محترفين.',
    first_name_label: 'الاسم الأول',
    first_name_placeholder: 'جون',
    last_name_label: 'اسم العائلة',
    last_name_placeholder: 'دو',
    email_label: 'البريد الإلكتروني',
    email_placeholder: 'm@example.com',
    password_label: 'كلمة المرور',
    user_type_label: 'أنا...',
    user_type_freelancer: 'مستقل (أبحث عن عمل)',
    user_type_employer: 'صاحب عمل (أتطلع للتوظيف)',
    submit_button: 'إنشاء حساب',
    submitting_button: 'جارٍ إنشاء الحساب...',
    login_link_text: 'هل لديك حساب بالفعل؟',
    login_link: 'تسجيل الدخول',
  },
  language_switcher: {
    change_language: 'تغيير اللغة',
    en: 'English',
    ar: 'العربية'
  }
} as const;
