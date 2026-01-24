export type Project = {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  employer: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  tags: string[];
  proposals: number;
};

export type Proposal = {
  id: string;
  freelancer: {
    name: string;
    avatar: string;
    title: string;
  };
  rate: number;
  coverLetter: string;
  date: string;
};

export type Conversation = {
  id: string;
  userName: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
};

export type Message = {
    id: string;
    text: string;
    timestamp: string;
    isSender: boolean;
}

export const projects: Project[] = [
  {
    id: "1",
    title: "Build a Modern E-commerce Website",
    description: "We are looking for an experienced full-stack developer to build a new e-commerce platform from scratch using Next.js, TypeScript, and PostgreSQL. The ideal candidate should have a strong portfolio of similar projects and a keen eye for design.",
    budget: 5000,
    deadline: "2024-08-30",
    employer: { name: "Creative Minds Inc.", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d", verified: true },
    tags: ["Next.js", "E-commerce", "Full-stack", "TypeScript"],
    proposals: 12,
  },
  {
    id: "2",
    title: "Mobile App Design for a Fitness Tracker",
    description: "We need a talented UI/UX designer to create a stunning and intuitive design for our new fitness tracking mobile application. You will be responsible for creating wireframes, mockups, and prototypes.",
    budget: 2500,
    deadline: "2024-08-15",
    employer: { name: "FitLife Solutions", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d", verified: true },
    tags: ["UI/UX", "Mobile App", "Figma", "Design"],
    proposals: 25,
  },
  {
    id: "3",
    title: "Content Writer for a Tech Blog",
    description: "Seeking a skilled content writer to produce high-quality articles for our tech blog. Topics include AI, software development, and cloud computing. Must have excellent research and writing skills.",
    budget: 800,
    deadline: "2024-09-01",
    employer: { name: "TechSavvy Media", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026706d", verified: false },
    tags: ["Content Writing", "SEO", "Technology"],
    proposals: 8,
  },
  {
    id: "4",
    title: "Setup CI/CD Pipeline with GitHub Actions",
    description: "We require a DevOps engineer to set up a continuous integration and continuous deployment (CI/CD) pipeline for our Node.js application using GitHub Actions. The pipeline should include testing, building, and deploying to AWS.",
    budget: 1200,
    deadline: "2024-08-10",
    employer: { name: "Innovate Labs", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026707d", verified: true },
    tags: ["DevOps", "CI/CD", "AWS", "GitHub Actions"],
    proposals: 5,
  },
];

export const proposals: Proposal[] = [
    {
        id: "1",
        freelancer: { name: "Alice Johnson", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026708d", title: "Senior Full-Stack Developer" },
        rate: 75,
        coverLetter: "I have extensive experience building scalable e-commerce platforms with Next.js and would love to bring my expertise to your project.",
        date: "2024-07-20",
    },
    {
        id: "2",
        freelancer: { name: "Bob Williams", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026709d", title: "React Developer" },
        rate: 60,
        coverLetter: "As a front-end specialist, I am confident I can build a fast, responsive, and user-friendly storefront for your e-commerce site.",
        date: "2024-07-21",
    }
];

export const conversations: Conversation[] = [
  { id: '1', userName: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026708d', lastMessage: 'Sounds good, I will get started on that right away.', lastMessageTime: '10:42 AM', unreadCount: 0 },
  { id: '2', userName: 'TechSavvy Media', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d', lastMessage: 'Can you provide a draft by Friday?', lastMessageTime: 'Yesterday', unreadCount: 2 },
  { id: '3', userName: 'FitLife Solutions', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d', lastMessage: 'The wireframes look great!', lastMessageTime: '3d ago', unreadCount: 0 },
];

export const messages: Message[] = [
    { id: '1', text: 'Hello! Thanks for the opportunity. I\'ve reviewed the project details.', isSender: true, timestamp: '10:30 AM' },
    { id: '2', text: 'Hi Alice, great to hear from you. We were impressed with your portfolio.', isSender: false, timestamp: '10:31 AM' },
    { id: '3', text: 'I believe my skills in Next.js and performance optimization are a perfect fit. When would be a good time to discuss the project further?', isSender: true, timestamp: '10:32 AM' },
    { id: '4', text: 'We are available to chat tomorrow at 2 PM EST. Does that work for you?', isSender: false, timestamp: '10:35 AM' },
    { id: '5', text: 'Yes, that works perfectly for me. Looking forward to it!', isSender: true, timestamp: '10:36 AM' },
    { id: '6', text: 'Sounds good, I will get started on that right away.', isSender: false, timestamp: '10:42 AM' },
];
