export default {
  header: {
    title: 'ConnectNow',
    links: {
      projects: 'Projects',
      dashboard: 'Dashboard',
      messages: 'Messages',
    },
    auth: {
      login: 'Log In',
      signup: 'Sign Up',
      logout: 'Log out',
    },
    userMenu: {
      dashboard: 'Dashboard',
    },
    mobile: {
      toggle: 'Toggle Menu',
    }
  },
  footer: {
    about: 'About',
    contact: 'Contact',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    rights: 'All rights reserved.',
  },
  home: {
    hero: {
      title: 'ConnectNow: Where Vision Meets Talent',
      subtitle: 'The ultimate platform for businesses to connect with skilled freelancers. Post projects, get proposals, and get work done.',
      post_project: 'Post a Project',
      browse_projects: 'Browse Projects',
    },
    features: {
      heading: 'Key Features',
      title: 'Everything You Need to Succeed',
      subtitle: 'ConnectNow provides a seamless and secure environment for both employers and freelancers to thrive.',
      talent: {
        title: 'Find the Perfect Talent',
        description: 'Post a job and get proposals from talented freelancers in minutes.',
      },
      payment: {
        title: 'Fixed-Price or Hourly',
        description: 'Choose how you want to pay, with secure payments and milestone tracking.',
      },
      collaboration: {
        title: 'Collaborate Easily',
        description: 'Use our platform to chat, share files, and track project progress.',
      },
      find_work: {
        title: 'Find Your Next Project',
        description: 'Browse thousands of projects and find work that matches your skills.',
      },
    },
    how_it_works: {
      title: 'How It Works',
      subtitle: 'Getting started is simple. Follow these three easy steps.',
      step1: {
        title: 'Post a Job',
        description: 'Describe your project, set your budget, and publish it for our community of freelancers.',
      },
      step2: {
        title: 'Hire a Freelancer',
        description: 'Review proposals, check profiles and portfolios, and hire the perfect candidate for your job.',
      },
      step3: {
        title: 'Get It Done',
        description: 'Collaborate with your freelancer, pay securely through our platform, and approve the final work.',
      },
    },
    cta: {
      title: 'Ready to bring your ideas to life?',
      subtitle: 'Join ConnectNow today and start your journey towards success, whether you\'re looking for talent or seeking new opportunities.',
      signup: 'Sign Up for Free',
    },
  },
  login: {
    title: 'Welcome Back',
    description: 'Enter your email below to log in to your account',
    email_label: 'Email',
    email_placeholder: 'm@example.com',
    password_label: 'Password',
    submit_button: 'Log In',
    submitting_button: 'Logging In...',
    signup_link_text: "Don't have an account?",
    signup_link: 'Sign up',
  },
  register: {
    title: 'Create an Account',
    description: 'Join ConnectNow to find work or hire professionals.',
    first_name_label: 'First Name',
    first_name_placeholder: 'John',
    last_name_label: 'Last Name',
    last_name_placeholder: 'Doe',
    email_label: 'Email',
    email_placeholder: 'm@example.com',
    password_label: 'Password',
    user_type_label: 'I am a...',
    user_type_freelancer: 'Freelancer (looking for work)',
    user_type_employer: 'Employer (looking to hire)',
    submit_button: 'Create Account',
    submitting_button: 'Creating Account...',
    login_link_text: 'Already have an account?',
    login_link: 'Log in',
  },
  language_switcher: {
    change_language: 'Change language',
    en: 'English',
    ar: 'العربية'
  }
} as const;
