export interface Job {
  id: string;
  company: string;
  logo: string;
  title: string;
  salaryGross: string;
  salaryNet: string;
  location: string;
  tags: string[];
  description: string;
  requirements: string[];
}

export interface Application {
  id: string;
  job: Job;
  status: 'sent' | 'viewed' | 'interview' | 'rejected';
  appliedAt: Date;
  viewedAt?: Date;
  updatedAt: Date;
}

export const mockJobs: Job[] = [
  {
    id: '1',
    company: 'VNG Corporation',
    logo: '🎮',
    title: 'Senior Product Manager',
    salaryGross: '50-80M VND',
    salaryNet: '40-64M VND',
    location: 'Q.7, HCM',
    tags: ['Hybrid', 'Tech', 'Insurance'],
    description: 'Leading product strategy for gaming platform with 10M+ users',
    requirements: ['5+ years PM experience', 'Gaming industry knowledge', 'Data-driven mindset']
  },
  {
    id: '2',
    company: 'Shopee',
    logo: '🛍️',
    title: 'Marketing Manager',
    salaryGross: '45-70M VND',
    salaryNet: '36-56M VND',
    location: 'Q.1, HCM',
    tags: ['Remote', 'E-commerce', '13th month'],
    description: 'Drive marketing campaigns for Southeast Asia\'s leading marketplace',
    requirements: ['3+ years marketing', 'E-commerce background', 'English fluent']
  },
  {
    id: '3',
    company: 'Tiki',
    logo: '📦',
    title: 'Data Analyst Lead',
    salaryGross: '40-60M VND',
    salaryNet: '32-48M VND',
    location: 'Q.Tân Bình, HCM',
    tags: ['Hybrid', 'Data', 'Stock Options'],
    description: 'Lead analytics team to optimize supply chain and customer experience',
    requirements: ['SQL & Python', '4+ years experience', 'Team management']
  },
  {
    id: '4',
    company: 'Grab',
    logo: '🚗',
    title: 'Senior Business Analyst',
    salaryGross: '55-85M VND',
    salaryNet: '44-68M VND',
    location: 'Q.2, HCM',
    tags: ['Remote', 'Fintech', 'RSU'],
    description: 'Strategic analysis for GrabPay expansion across Vietnam',
    requirements: ['5+ years BA experience', 'Fintech knowledge', 'Stakeholder management']
  },
  {
    id: '5',
    company: 'Momo',
    logo: '💰',
    title: 'Product Owner - Payments',
    salaryGross: '60-90M VND',
    salaryNet: '48-72M VND',
    location: 'Q.1, HCM',
    tags: ['Hybrid', 'Fintech', 'Premium Health'],
    description: 'Own payment product roadmap for Vietnam\'s super app',
    requirements: ['Payment domain expertise', 'Agile/Scrum', '4+ years PO']
  }
];

export const currentUser = {
  name: 'Nguyễn Văn A',
  currentCompany: 'FPT Software',
  currentSalary: 35000000,
  yearsOfExperience: 5,
  skills: ['Product Management', 'Data Analysis', 'Agile', 'SQL'],
  linkedinUrl: 'https://linkedin.com/in/nguyen-van-a',
  ghostMode: false,
  blockedCompanies: ['FPT Software']
};
