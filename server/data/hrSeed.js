export const INTERVIEW_STAGES = [
  { id: 'applied', label: 'Applied', color: '#64748B' },
  { id: 'screening', label: 'Screening', color: '#2563EB' },
  { id: 'technical', label: 'Technical Interview', color: '#7C3AED' },
  { id: 'culture', label: 'Culture Fit', color: '#D97706' },
  { id: 'offer', label: 'Offer', color: '#059669' },
  { id: 'hired', label: 'Hired', color: '#059669' },
  { id: 'rejected', label: 'Rejected', color: '#DC2626' },
];

export const HR_EMPLOYEES = [
  { id: 'he1', employeeId: 'EMP-1001', name: 'John Doe', ini: 'JD', role: 'Senior Software Engineer', department: 'Engineering', email: 'john.doe@voltuswave.io', phone: '+91 98765 43210', location: 'Hyderabad', status: 'active', employmentType: 'Full-time', joinedAt: '2021-03-15', reportsToId: 'he2', bio: 'Full-stack engineer focused on platform reliability and API design.', skills: ['Node.js', 'React', 'PostgreSQL', 'Microservices'] },
  { id: 'he2', employeeId: 'EMP-1002', name: 'Jane Smith', ini: 'JS', role: 'Tech Lead', department: 'Engineering', email: 'jane.smith@voltuswave.io', phone: '+91 87654 32109', location: 'Bangalore', status: 'active', employmentType: 'Full-time', joinedAt: '2019-08-22', reportsToId: '', bio: 'Engineering lead driving delivery excellence across product squads.', skills: ['Architecture', 'Team Leadership', 'Code Review', 'Agile'] },
  {
    id: 'he3',
    employeeId: 'EMP-1003',
    name: 'Alice Brown',
    ini: 'AB',
    role: 'HR Manager',
    department: 'HR & Admin',
    email: 'alice.brown@voltuswave.io',
    phone: '+91 76543 21098',
    location: 'Hyderabad',
    status: 'on-leave',
    employmentType: 'Full-time',
    joinedAt: '2018-01-10',
    reportsToId: '',
    bio: 'HR business partner overseeing talent, culture, and employee lifecycle programs.',
    skills: ['HR Policy', 'Onboarding', 'Employee Relations', 'Compliance'],
    documents: [
      { id: 'doc-he3-1', type: 'offer-letter', fileName: 'Alice_Brown_Offer_Letter.pdf', size: 248000, uploadedAt: '2018-01-05' },
      { id: 'doc-he3-2', type: 'id-proof', fileName: 'Aadhaar_Card_Alice_Brown.pdf', size: 156000, uploadedAt: '2018-01-08' },
      { id: 'doc-he3-3', type: 'employment-contract', fileName: 'Employment_Contract_2018.pdf', size: 312000, uploadedAt: '2018-01-10' },
      { id: 'doc-he3-4', type: 'education', fileName: 'MBA_Certificate.pdf', size: 890000, uploadedAt: '2018-01-08' },
    ],
    payslips: [
      {
        id: 'ps-he3-1',
        month: '2025-05',
        periodLabel: 'May 2025',
        fileName: 'Payslip_May_2025.pdf',
        size: 186000,
        netPay: 141000,
        grossPay: 150000,
        uploadedAt: '2025-06-01',
        uploadedBy: 'HR',
      },
      {
        id: 'ps-he3-2',
        month: '2025-04',
        periodLabel: 'April 2025',
        fileName: 'Payslip_April_2025.pdf',
        size: 182000,
        netPay: 141000,
        grossPay: 150000,
        uploadedAt: '2025-05-02',
        uploadedBy: 'HR',
      },
    ],
  },
  { id: 'he4', employeeId: 'EMP-1004', name: 'Sarah Johnson', ini: 'SJ', role: 'Senior Product Manager', department: 'Product', email: 'sarah.johnson@voltuswave.io', phone: '+91 65432 10987', location: 'Bangalore', status: 'active', employmentType: 'Full-time', joinedAt: '2020-06-01' },
  { id: 'he5', employeeId: 'EMP-1005', name: 'Michael Chen', ini: 'MC', role: 'Software Engineer', department: 'Engineering', email: 'michael.chen@voltuswave.io', phone: '+91 54321 09876', location: 'Hyderabad', status: 'active', employmentType: 'Full-time', joinedAt: '2022-11-14', reportsToId: 'he1' },
  { id: 'he6', employeeId: 'EMP-1006', name: 'Emma Wilson', ini: 'EW', role: 'Marketing Manager', department: 'Marketing', email: 'emma.wilson@voltuswave.io', phone: '+91 43210 98765', location: 'Mumbai', status: 'active', employmentType: 'Full-time', joinedAt: '2021-09-20' },
  {
    id: 'he7',
    employeeId: 'EMP-1007',
    name: 'David Lee',
    ini: 'DL',
    role: 'Senior Engineer',
    department: 'Engineering',
    email: 'david.lee@voltuswave.io',
    phone: '+91 32109 87654',
    location: 'Bangalore',
    status: 'active',
    employmentType: 'Full-time',
    joinedAt: '2017-04-05',
    documents: [
      { id: 'doc-he7-1', type: 'offer-letter', fileName: 'David_Lee_Offer_Letter.pdf', size: 235000, uploadedAt: '2017-03-28' },
      { id: 'doc-he7-2', type: 'resume', fileName: 'David_Lee_Resume.pdf', size: 178000, uploadedAt: '2017-03-25' },
      { id: 'doc-he7-3', type: 'tax-form', fileName: 'PAN_Card_David_Lee.pdf', size: 92000, uploadedAt: '2017-04-05' },
    ],
  },
  { id: 'he8', employeeId: 'EMP-1008', name: 'Priya Sharma', ini: 'PS', role: 'Product Lead', department: 'Product', email: 'priya.sharma@voltuswave.io', phone: '+91 21098 76543', location: 'Hyderabad', status: 'active', employmentType: 'Full-time', joinedAt: '2019-12-18' },
  { id: 'he9', employeeId: 'EMP-1009', name: 'Robert Taylor', ini: 'RT', role: 'Sales Director', department: 'Sales', email: 'robert.taylor@voltuswave.io', phone: '+91 10987 65432', location: 'Mumbai', status: 'active', employmentType: 'Full-time', joinedAt: '2016-07-30' },
  { id: 'he10', employeeId: 'EMP-1010', name: 'Lisa Anderson', ini: 'LA', role: 'UX Designer', department: 'Design', email: 'lisa.anderson@voltuswave.io', phone: '+91 99887 76655', location: 'Remote', status: 'on-leave', employmentType: 'Full-time', joinedAt: '2023-02-01' },
  { id: 'he11', employeeId: 'EMP-1011', name: 'James Wilson', ini: 'JW', role: 'Finance Analyst', department: 'Finance', email: 'james.wilson@voltuswave.io', phone: '+91 88776 65544', location: 'Hyderabad', status: 'active', employmentType: 'Full-time', joinedAt: '2020-10-12' },
  { id: 'he12', employeeId: 'EMP-1012', name: 'Maria Garcia', ini: 'MG', role: 'Operations Manager', department: 'Operations', email: 'maria.garcia@voltuswave.io', phone: '+91 77665 54433', location: 'Bangalore', status: 'active', employmentType: 'Contract', joinedAt: '2024-01-08' },
];

export const JOB_OPENINGS = [
  {
    id: 'job-1',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    type: 'Full-time',
    location: 'Hyderabad',
    status: 'open',
    postedAt: '2025-10-01',
    hiringManagerId: 'he1',
    description: 'Build scalable microservices for the VoltusWave platform.',
    salary: '₹18–24 LPA',
    applications: 45,
    shortlisted: 12,
    interviews: 5,
  },
  {
    id: 'job-2',
    title: 'Product Manager',
    department: 'Product',
    type: 'Full-time',
    location: 'Bangalore',
    status: 'open',
    postedAt: '2025-09-25',
    hiringManagerId: 'he8',
    description: 'Own product roadmap and cross-functional delivery for HR suite.',
    salary: '₹20–28 LPA',
    applications: 38,
    shortlisted: 10,
    interviews: 3,
  },
  {
    id: 'job-3',
    title: 'UX Designer',
    department: 'Design',
    type: 'Full-time',
    location: 'Remote',
    status: 'open',
    postedAt: '2025-10-05',
    hiringManagerId: 'he8',
    description: 'Design intuitive experiences across VoltusWorkspace apps.',
    salary: '₹12–18 LPA',
    applications: 22,
    shortlisted: 6,
    interviews: 2,
  },
];

export const CANDIDATES = [
  {
    id: 'cand-1',
    jobId: 'job-1',
    name: 'Arjun Mehta',
    ini: 'AM',
    email: 'arjun.mehta@email.com',
    phone: '+91 98765 43210',
    source: 'LinkedIn',
    reference: '',
    appliedAt: '2025-10-02',
    stage: 'technical',
    resume: { fileName: 'Arjun_Mehta_Resume.pdf', url: '#', uploadedAt: '2025-10-02' },
    experience: '6 years',
    currentRole: 'Senior Developer at TechCorp',
    assignedInterviewers: ['he2', 'he7'],
    notes: 'Strong backend experience with Node.js and PostgreSQL.',
    stageHistory: [
      { stage: 'applied', at: '2025-10-02', by: 'he3' },
      { stage: 'screening', at: '2025-10-05', by: 'he3' },
      { stage: 'technical', at: '2025-10-08', by: 'he1' },
    ],
  },
  {
    id: 'cand-2',
    jobId: 'job-1',
    name: 'Priya Nair',
    ini: 'PN',
    email: 'priya.nair@email.com',
    phone: '+91 87654 32109',
    source: 'Referral',
    reference: 'David Lee',
    appliedAt: '2025-10-03',
    stage: 'screening',
    resume: { fileName: 'Priya_Nair_CV.pdf', url: '#', uploadedAt: '2025-10-03' },
    experience: '4 years',
    currentRole: 'Full Stack Developer at StartupX',
    assignedInterviewers: ['he3'],
    notes: 'Referred by David Lee.',
    stageHistory: [
      { stage: 'applied', at: '2025-10-03', by: 'he3' },
      { stage: 'screening', at: '2025-10-07', by: 'he3' },
    ],
  },
  {
    id: 'cand-3',
    jobId: 'job-1',
    name: 'Rahul Verma',
    ini: 'RV',
    email: 'rahul.verma@email.com',
    phone: '+91 76543 21098',
    source: 'Careers Page',
    reference: '',
    appliedAt: '2025-10-04',
    stage: 'culture',
    resume: { fileName: 'Rahul_Verma_Resume.pdf', url: '#', uploadedAt: '2025-10-04' },
    experience: '7 years',
    currentRole: 'Staff Engineer at BigTech',
    assignedInterviewers: ['he1', 'he3'],
    notes: 'Passed technical round with excellent system design scores.',
    stageHistory: [
      { stage: 'applied', at: '2025-10-04', by: 'he3' },
      { stage: 'screening', at: '2025-10-06', by: 'he3' },
      { stage: 'technical', at: '2025-10-09', by: 'he2' },
      { stage: 'culture', at: '2025-10-11', by: 'he1' },
    ],
  },
  {
    id: 'cand-4',
    jobId: 'job-1',
    name: 'Sneha Reddy',
    ini: 'SR',
    email: 'sneha.reddy@email.com',
    phone: '+91 65432 10987',
    source: 'LinkedIn',
    reference: '',
    appliedAt: '2025-10-05',
    stage: 'offer',
    resume: { fileName: 'Sneha_Reddy_CV.pdf', url: '#', uploadedAt: '2025-10-05' },
    experience: '5 years',
    currentRole: 'Backend Lead at FinServ Co',
    assignedInterviewers: ['he1', 'he2'],
    notes: 'Offer extended, awaiting acceptance.',
    stageHistory: [
      { stage: 'applied', at: '2025-10-05', by: 'he3' },
      { stage: 'screening', at: '2025-10-07', by: 'he3' },
      { stage: 'technical', at: '2025-10-10', by: 'he7' },
      { stage: 'culture', at: '2025-10-12', by: 'he1' },
      { stage: 'offer', at: '2025-10-14', by: 'he1' },
    ],
  },
  {
    id: 'cand-5',
    jobId: 'job-2',
    name: 'Anita Kapoor',
    ini: 'AK',
    email: 'anita.kapoor@email.com',
    phone: '+91 54321 09876',
    source: 'LinkedIn',
    reference: '',
    appliedAt: '2025-09-28',
    stage: 'technical',
    resume: { fileName: 'Anita_Kapoor_Resume.pdf', url: '#', uploadedAt: '2025-09-28' },
    experience: '8 years',
    currentRole: 'Product Manager at SaaS Inc',
    assignedInterviewers: ['he8', 'he4'],
    notes: 'Strong product sense and stakeholder management.',
    stageHistory: [
      { stage: 'applied', at: '2025-09-28', by: 'he3' },
      { stage: 'screening', at: '2025-10-01', by: 'he3' },
      { stage: 'technical', at: '2025-10-10', by: 'he8' },
    ],
  },
  {
    id: 'cand-6',
    jobId: 'job-2',
    name: 'Vikram Singh',
    ini: 'VS',
    email: 'vikram.singh@email.com',
    phone: '+91 43210 98765',
    source: 'Referral',
    reference: 'Jane Smith',
    appliedAt: '2025-10-01',
    stage: 'screening',
    resume: { fileName: 'Vikram_Singh_CV.pdf', url: '#', uploadedAt: '2025-10-01' },
    experience: '5 years',
    currentRole: 'Associate PM at E-commerce Co',
    assignedInterviewers: ['he8'],
    notes: '',
    stageHistory: [
      { stage: 'applied', at: '2025-10-01', by: 'he3' },
      { stage: 'screening', at: '2025-10-08', by: 'he3' },
    ],
  },
  {
    id: 'cand-7',
    jobId: 'job-3',
    name: 'Lisa Park',
    ini: 'LP',
    email: 'lisa.park@email.com',
    phone: '+91 32109 87654',
    source: 'Behance',
    reference: '',
    appliedAt: '2025-10-06',
    stage: 'applied',
    resume: { fileName: 'Lisa_Park_Portfolio.pdf', url: '#', uploadedAt: '2025-10-06' },
    experience: '3 years',
    currentRole: 'UX Designer at Design Studio',
    assignedInterviewers: [],
    notes: 'Impressive portfolio with B2B SaaS work.',
    stageHistory: [{ stage: 'applied', at: '2025-10-06', by: 'he3' }],
  },
  {
    id: 'cand-8',
    jobId: 'job-1',
    name: 'Kiran Patel',
    ini: 'KP',
    email: 'kiran.patel@email.com',
    phone: '+91 21098 76543',
    source: 'Careers Page',
    reference: '',
    appliedAt: '2025-09-30',
    stage: 'rejected',
    resume: { fileName: 'Kiran_Patel_Resume.pdf', url: '#', uploadedAt: '2025-09-30' },
    experience: '2 years',
    currentRole: 'Junior Developer',
    assignedInterviewers: ['he2'],
    notes: 'Did not meet experience requirements.',
    stageHistory: [
      { stage: 'applied', at: '2025-09-30', by: 'he3' },
      { stage: 'screening', at: '2025-10-03', by: 'he3' },
      { stage: 'rejected', at: '2025-10-04', by: 'he2' },
    ],
  },
];

export const INTERVIEWS = [
  {
    id: 'int-1',
    candidateId: 'cand-1',
    jobId: 'job-1',
    stage: 'technical',
    scheduledAt: '2025-10-15T10:00:00Z',
    duration: '60 min',
    type: 'Video Call',
    interviewerIds: ['he2', 'he7'],
    status: 'scheduled',
    location: 'Google Meet',
  },
  {
    id: 'int-2',
    candidateId: 'cand-3',
    jobId: 'job-1',
    stage: 'culture',
    scheduledAt: '2025-10-13T14:00:00Z',
    duration: '45 min',
    type: 'In Person',
    interviewerIds: ['he1', 'he3'],
    status: 'completed',
    location: 'Hyderabad Office — Room 3A',
  },
  {
    id: 'int-3',
    candidateId: 'cand-5',
    jobId: 'job-2',
    stage: 'technical',
    scheduledAt: '2025-10-16T11:00:00Z',
    duration: '60 min',
    type: 'Video Call',
    interviewerIds: ['he8', 'he4'],
    status: 'scheduled',
    location: 'Zoom',
  },
  {
    id: 'int-4',
    candidateId: 'cand-4',
    jobId: 'job-1',
    stage: 'culture',
    scheduledAt: '2025-10-12T15:00:00Z',
    duration: '45 min',
    type: 'Video Call',
    interviewerIds: ['he1'],
    status: 'completed',
    location: 'Google Meet',
  },
  {
    id: 'int-5',
    candidateId: 'cand-2',
    jobId: 'job-1',
    stage: 'screening',
    scheduledAt: '2025-10-18T09:30:00Z',
    duration: '30 min',
    type: 'Video Call',
    interviewerIds: ['he3'],
    status: 'scheduled',
    location: 'Google Meet',
  },
  {
    id: 'int-6',
    candidateId: 'cand-6',
    jobId: 'job-2',
    stage: 'screening',
    scheduledAt: '2025-10-17T13:00:00Z',
    duration: '45 min',
    type: 'Video Call',
    interviewerIds: ['he8'],
    status: 'scheduled',
    location: 'Zoom',
  },
];

export const FEEDBACK_FORMS = [
  {
    id: 'fb-1',
    interviewId: 'int-2',
    candidateId: 'cand-3',
    interviewerId: 'he1',
    stage: 'culture',
    ratings: { communication: 4, teamwork: 5, cultureFit: 4, motivation: 5 },
    recommendation: 'Strong Hire',
    comments: 'Excellent cultural alignment. Demonstrates leadership qualities and collaborative mindset.',
    strengths: 'Clear communication, team player, growth mindset',
    weaknesses: 'Could improve on conflict resolution examples',
    submittedAt: '2025-10-13T15:30:00Z',
  },
  {
    id: 'fb-2',
    interviewId: 'int-2',
    candidateId: 'cand-3',
    interviewerId: 'he3',
    stage: 'culture',
    ratings: { communication: 5, teamwork: 4, cultureFit: 5, motivation: 4 },
    recommendation: 'Hire',
    comments: 'Great fit for the engineering culture. Would work well with the team.',
    strengths: 'Empathetic, proactive, values-driven',
    weaknesses: 'None significant',
    submittedAt: '2025-10-13T16:00:00Z',
  },
  {
    id: 'fb-3',
    interviewId: 'int-4',
    candidateId: 'cand-4',
    interviewerId: 'he1',
    stage: 'culture',
    ratings: { communication: 5, teamwork: 5, cultureFit: 5, motivation: 5 },
    recommendation: 'Strong Hire',
    comments: 'Top candidate. Ready to extend offer immediately.',
    strengths: 'Technical depth, leadership, cultural alignment',
    weaknesses: 'Salary expectations slightly above band',
    submittedAt: '2025-10-12T16:15:00Z',
  },
  {
    id: 'fb-4',
    interviewId: null,
    candidateId: 'cand-1',
    interviewerId: 'he2',
    stage: 'screening',
    ratings: { communication: 4, technical: 4, experience: 4, potential: 5 },
    recommendation: 'Proceed',
    comments: 'Good screening call. Recommend moving to technical round.',
    strengths: 'Solid Node.js background, clear articulation',
    weaknesses: 'Limited cloud experience',
    submittedAt: '2025-10-05T11:00:00Z',
  },
];

export const ONBOARDING_NEW_HIRES = [
  {
    id: 'onb-1',
    employeeId: 'he4',
    name: 'Sarah Johnson',
    ini: 'SJ',
    role: 'Senior Product Manager',
    department: 'Product',
    email: 'sarah.johnson.new@voltuswave.io',
    phone: '+91 65432 10987',
    location: 'Bangalore',
    joiningDate: '2025-10-25',
    reportingToId: 'he1',
    status: 'upcoming',
    notes: 'Joining the product squad for the HR suite rollout. Offer accepted on Oct 8.',
    preJoiningTasks: { completed: 3, total: 5 },
    tasks: [
      { id: 't1', label: 'Send offer letter', done: true, owner: 'HR', description: 'Signed offer letter shared with the candidate' },
      { id: 't2', label: 'Collect documents', done: true, owner: 'HR', description: 'ID proof, address proof, and education certificates received' },
      { id: 't3', label: 'IT equipment request', done: true, owner: 'HR', description: 'Laptop and access credentials requested from IT' },
      { id: 't4', label: 'Background verification', done: false, owner: 'HR', description: 'BGV initiated and report pending from vendor' },
      { id: 't5', label: 'Welcome kit preparation', done: false, owner: 'HR', description: 'ID card, welcome kit, and desk allocation' },
    ],
  },
  {
    id: 'onb-2',
    employeeId: 'he5',
    name: 'Michael Chen',
    ini: 'MC',
    role: 'Software Engineer',
    department: 'Engineering',
    email: 'michael.chen.new@voltuswave.io',
    phone: '+91 54321 09876',
    location: 'Hyderabad',
    joiningDate: '2025-10-28',
    reportingToId: 'he2',
    status: 'upcoming',
    notes: 'Referred hire. All pre-joining tasks completed ahead of schedule.',
    preJoiningTasks: { completed: 5, total: 5 },
    tasks: [
      { id: 't1', label: 'Send offer letter', done: true, owner: 'HR', description: 'Signed offer letter shared with the candidate' },
      { id: 't2', label: 'Collect documents', done: true, owner: 'HR', description: 'All mandatory documents verified and filed' },
      { id: 't3', label: 'IT equipment request', done: true, owner: 'HR', description: 'MacBook and monitor allocated' },
      { id: 't4', label: 'Background verification', done: true, owner: 'HR', description: 'BGV cleared with no flags' },
      { id: 't5', label: 'Welcome kit preparation', done: true, owner: 'HR', description: 'Welcome kit and ID card ready' },
    ],
  },
  {
    id: 'onb-3',
    employeeId: 'he6',
    name: 'Emma Wilson',
    ini: 'EW',
    role: 'Marketing Manager',
    department: 'Marketing',
    email: 'emma.wilson@voltuswave.io',
    phone: '+91 43210 98765',
    location: 'Mumbai',
    joinedDate: '2025-10-01',
    reportingToId: 'he1',
    status: 'in-progress',
    notes: 'Onboarding buddy assigned. Compliance training scheduled for next week.',
    onboardingBuddyId: 'he3',
    probationDaysRemaining: 75,
    progress: 65,
    checklist: [
      { id: 'c1', label: 'Complete HR orientation', done: true },
      { id: 'c2', label: 'Set up workstation', done: true },
      { id: 'c3', label: 'Meet team members', done: true },
      { id: 'c4', label: 'Complete compliance training', done: false },
      { id: 'c5', label: '30-day check-in with manager', done: false },
      { id: 'c6', label: 'Submit probation goals', done: false },
    ],
  },
];

const FINANCE_OVERRIDES = {
  he7: {
    annualSalary: 2200000,
    monthlyGross: 183333,
    totalPaidToDate: 15840000,
    ytdEarnings: 916665,
    ytdDeductions: 82500,
    ytdNetPaid: 834165,
    lastPaymentDate: '2025-05-31',
    lastPaymentAmount: 169583,
    bankName: 'HDFC Bank',
    bankAccountMasked: '****4521',
    panMasked: 'ABCDE****F',
    uan: '****8901',
    paymentHistory: [
      { id: 'pay-7-1', period: 'May 2025', payDate: '2025-05-31', gross: 183333, deductions: 13750, net: 169583, status: 'Paid' },
      { id: 'pay-7-2', period: 'Apr 2025', payDate: '2025-04-30', gross: 183333, deductions: 13750, net: 169583, status: 'Paid' },
      { id: 'pay-7-3', period: 'Mar 2025', payDate: '2025-03-31', gross: 183333, deductions: 13750, net: 169583, status: 'Paid' },
      { id: 'pay-7-4', period: 'Feb 2025', payDate: '2025-02-28', gross: 183333, deductions: 13750, net: 169583, status: 'Paid' },
      { id: 'pay-7-5', period: 'Jan 2025', payDate: '2025-01-31', gross: 183333, deductions: 13750, net: 169583, status: 'Paid' },
    ],
    reimbursements: [
      { id: 'rmb-7-1', description: 'Client visit travel', amount: 12500, date: '2025-04-15', status: 'Paid' },
      { id: 'rmb-7-2', description: 'Home internet allowance', amount: 2000, date: '2025-05-01', status: 'Paid' },
    ],
    bonuses: [{ id: 'bon-7-1', label: 'Annual performance bonus FY24', amount: 150000, date: '2025-03-15', status: 'Paid' }],
  },
  he1: {
    annualSalary: 1800000,
    monthlyGross: 150000,
    totalPaidToDate: 7200000,
    ytdEarnings: 750000,
    ytdDeductions: 45000,
    ytdNetPaid: 705000,
    lastPaymentDate: '2025-05-31',
    lastPaymentAmount: 141000,
    bankName: 'ICICI Bank',
    bankAccountMasked: '****7832',
    panMasked: 'FGHIJ****K',
    uan: '****2345',
    paymentHistory: [
      { id: 'pay-1-1', period: 'May 2025', payDate: '2025-05-31', gross: 150000, deductions: 9000, net: 141000, status: 'Paid' },
      { id: 'pay-1-2', period: 'Apr 2025', payDate: '2025-04-30', gross: 150000, deductions: 9000, net: 141000, status: 'Paid' },
    ],
    reimbursements: [],
    bonuses: [],
  },
};

const ASSET_OVERRIDES = {
  he7: [
    { id: 'ast-7-1', name: 'MacBook Pro 14" M3', category: 'Laptop', serial: 'C02XL0ABCDEF', assetTag: 'VW-LT-2041', assignedAt: '2023-06-01', status: 'Assigned', value: 185000 },
    { id: 'ast-7-2', name: 'Dell UltraSharp 27" 4K', category: 'Monitor', serial: 'DL-MON-9921', assetTag: 'VW-MN-8832', assignedAt: '2023-06-01', status: 'Assigned', value: 42000 },
    { id: 'ast-7-3', name: 'Logitech MX Keys + Master 3', category: 'Accessories', serial: 'LG-ACC-4412', assetTag: 'VW-AC-1209', assignedAt: '2023-06-01', status: 'Assigned', value: 12000 },
    { id: 'ast-7-4', name: 'Company ID Card', category: 'ID Card', serial: 'ID-EMP-1007', assetTag: 'VW-ID-1007', assignedAt: '2017-04-05', status: 'Assigned', value: 0 },
  ],
  he1: [
    { id: 'ast-1-1', name: 'MacBook Air M2', category: 'Laptop', serial: 'C02AB12CDEF', assetTag: 'VW-LT-1892', assignedAt: '2021-03-20', status: 'Assigned', value: 115000 },
    { id: 'ast-1-2', name: 'LG 24" Monitor', category: 'Monitor', serial: 'LG-MON-3310', assetTag: 'VW-MN-7102', assignedAt: '2021-03-20', status: 'Assigned', value: 18000 },
  ],
  he10: [
    { id: 'ast-10-1', name: 'MacBook Pro 16"', category: 'Laptop', serial: 'C02DS98WXYZ', assetTag: 'VW-LT-3102', assignedAt: '2023-02-05', status: 'Assigned', value: 210000 },
    { id: 'ast-10-2', name: 'iPad Pro 12.9"', category: 'Tablet', serial: 'IP-TB-8821', assetTag: 'VW-TB-0441', assignedAt: '2023-02-05', status: 'Assigned', value: 95000 },
    { id: 'ast-10-3', name: 'Wacom Intuos Pro', category: 'Accessories', serial: 'WC-DRW-112', assetTag: 'VW-AC-2201', assignedAt: '2023-02-05', status: 'Assigned', value: 28000 },
  ],
};

function monthsSince(joinedAt) {
  if (!joinedAt) return 12;
  const start = new Date(joinedAt);
  const now = new Date();
  return Math.max(1, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()));
}

function estimateMonthlyGross(role = '', department = '') {
  const r = role.toLowerCase();
  if (r.includes('director') || r.includes('lead')) return 200000;
  if (r.includes('senior') || r.includes('manager')) return 150000;
  if (department === 'Engineering' || department === 'Product') return 120000;
  if (department === 'Sales') return 110000;
  return 90000;
}

export function getEmployeeFinance(emp) {
  if (FINANCE_OVERRIDES[emp.id]) {
    return { currency: 'INR', ...FINANCE_OVERRIDES[emp.id], payslips: sortPayslips(emp.payslips) };
  }
  const monthlyGross = estimateMonthlyGross(emp.role, emp.department);
  const months = monthsSince(emp.joinedAt);
  const annualSalary = monthlyGross * 12;
  const ytdMonths = Math.min(months, new Date().getMonth() + 1);
  const ytdEarnings = monthlyGross * ytdMonths;
  const ytdDeductions = Math.round(ytdEarnings * 0.06);
  const history = [];
  for (let i = 0; i < Math.min(6, ytdMonths); i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const period = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const payDate = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
    const deductions = Math.round(monthlyGross * 0.06);
    history.push({
      id: `pay-${emp.id}-${i}`,
      period,
      payDate,
      gross: monthlyGross,
      deductions,
      net: monthlyGross - deductions,
      status: 'Paid',
    });
  }
  return {
    currency: 'INR',
    annualSalary,
    monthlyGross,
    totalPaidToDate: monthlyGross * months,
    ytdEarnings,
    ytdDeductions,
    ytdNetPaid: ytdEarnings - ytdDeductions,
    lastPaymentDate: history[0]?.payDate || new Date().toISOString().slice(0, 10),
    lastPaymentAmount: history[0]?.net || monthlyGross,
    bankName: 'HDFC Bank',
    bankAccountMasked: '****' + String(1000 + (emp.id?.length || 0) * 111).slice(-4),
    panMasked: 'XXXXX****X',
    uan: '****' + String(2000 + months).slice(-4),
    paymentHistory: history,
    reimbursements: [],
    bonuses: [],
    payslips: sortPayslips(emp.payslips),
  };
}

function sortPayslips(payslips = []) {
  return [...payslips].sort(
    (a, b) =>
      new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime(),
  );
}

export function formatPayPeriodLabel(month) {
  if (!month) return '';
  const [year, mon] = String(month).split('-').map(Number);
  if (!year || !mon) return month;
  return new Date(year, mon - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function addMonthsToDate(dateStr, months) {
  if (!dateStr || months == null || months === '') return '';
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + Number(months));
  return d.toISOString().slice(0, 10);
}

function probationStatus(until) {
  if (!until) return 'none';
  return new Date(until) < new Date() ? 'completed' : 'active';
}

const EMPLOYMENT_TERMS_OVERRIDES = {
  he7: {
    probation: { durationMonths: 6, until: '2017-10-05', status: 'completed' },
    bond: { applicable: true, durationMonths: 24, until: '2019-04-05', amount: 500000 },
    noticePeriod: { duringProbationDays: 15, afterProbationDays: 60 },
  },
  he1: {
    probation: { durationMonths: 6, until: '2021-09-15', status: 'completed' },
    bond: { applicable: true, durationMonths: 18, until: '2022-09-15', amount: 300000 },
    noticePeriod: { duringProbationDays: 15, afterProbationDays: 60 },
  },
  he12: {
    probation: { durationMonths: 3, until: '2024-04-08', status: 'completed' },
    bond: { applicable: false, durationMonths: 0, until: '', amount: 0 },
    noticePeriod: { duringProbationDays: 7, afterProbationDays: 30 },
  },
};

export function getEmployeeEmploymentTerms(emp) {
  if (emp.employmentTerms) {
    const terms = { ...emp.employmentTerms };
    if (terms.probation && !terms.probation.status) {
      terms.probation = { ...terms.probation, status: probationStatus(terms.probation.until) };
    }
    return terms;
  }
  if (EMPLOYMENT_TERMS_OVERRIDES[emp.id]) return EMPLOYMENT_TERMS_OVERRIDES[emp.id];

  const isContract = emp.employmentType === 'Contract';
  const probationMonths = isContract ? 3 : 6;
  const probationUntil = addMonthsToDate(emp.joinedAt, probationMonths);
  const bondApplicable = emp.employmentType === 'Full-time';
  const bondMonths = bondApplicable ? 24 : 0;

  return {
    probation: {
      durationMonths: probationMonths,
      until: probationUntil,
      status: probationStatus(probationUntil),
    },
    bond: {
      applicable: bondApplicable,
      durationMonths: bondMonths,
      until: bondApplicable ? addMonthsToDate(emp.joinedAt, bondMonths) : '',
      amount: bondApplicable ? 300000 : 0,
    },
    noticePeriod: {
      duringProbationDays: isContract ? 7 : 15,
      afterProbationDays: isContract ? 30 : 60,
    },
  };
}

const PERFORMANCE_OVERRIDES = {
  he7: {
    overallRating: 4.6,
    ratingLabel: 'Exceeds Expectations',
    lastReviewDate: '2025-03-15',
    nextReviewDate: '2025-09-15',
    reviewCycle: 'Half-yearly',
    reviewer: 'Jane Smith',
    goals: [
      { id: 'g-7-1', title: 'Lead platform reliability initiative', progress: 90, status: 'On Track' },
      { id: 'g-7-2', title: 'Mentor 2 junior engineers', progress: 75, status: 'On Track' },
      { id: 'g-7-3', title: 'Reduce API latency by 20%', progress: 100, status: 'Completed' },
    ],
    kpis: [
      { id: 'k-7-1', label: 'Delivery & Quality', score: 4.7, target: 4.0 },
      { id: 'k-7-2', label: 'Collaboration', score: 4.5, target: 4.0 },
      { id: 'k-7-3', label: 'Innovation', score: 4.4, target: 4.0 },
      { id: 'k-7-4', label: 'Ownership', score: 4.8, target: 4.0 },
    ],
    reviews: [
      {
        id: 'rev-7-1',
        period: 'H2 FY24',
        rating: 4.6,
        reviewer: 'Jane Smith',
        date: '2025-03-15',
        summary: 'Consistently delivers high-quality work and mentors the team effectively.',
      },
      {
        id: 'rev-7-2',
        period: 'H1 FY24',
        rating: 4.4,
        reviewer: 'Jane Smith',
        date: '2024-09-20',
        summary: 'Strong technical contributions and reliable sprint delivery.',
      },
    ],
  },
  he3: {
    overallRating: 4.3,
    ratingLabel: 'Meets Expectations',
    lastReviewDate: '2025-02-28',
    nextReviewDate: '2025-08-28',
    reviewCycle: 'Half-yearly',
    reviewer: 'John Doe',
    goals: [
      { id: 'g-3-1', title: 'Streamline onboarding process', progress: 80, status: 'On Track' },
      { id: 'g-3-2', title: 'Employee engagement score above 8.0', progress: 65, status: 'In Progress' },
      { id: 'g-3-3', title: 'Complete HR policy refresh', progress: 100, status: 'Completed' },
    ],
    kpis: [
      { id: 'k-3-1', label: 'Employee Satisfaction', score: 4.2, target: 4.0 },
      { id: 'k-3-2', label: 'Process Efficiency', score: 4.4, target: 4.0 },
      { id: 'k-3-3', label: 'Compliance', score: 4.5, target: 4.0 },
    ],
    reviews: [
      {
        id: 'rev-3-1',
        period: 'H2 FY24',
        rating: 4.3,
        reviewer: 'John Doe',
        date: '2025-02-28',
        summary: 'Effective HR partner with strong employee relations focus.',
      },
    ],
  },
};

function defaultPerformanceForRole(emp) {
  const isLead = /lead|manager|director/i.test(emp.role || '');
  return {
    overallRating: isLead ? 4.2 : 3.9,
    ratingLabel: isLead ? 'Meets Expectations' : 'Developing',
    lastReviewDate: '2024-12-15',
    nextReviewDate: '2025-06-15',
    reviewCycle: 'Half-yearly',
    reviewer: emp.reportsToId ? 'Manager' : 'HR',
    goals: [
      { id: `g-${emp.id}-1`, title: 'Complete assigned project deliverables', progress: 70, status: 'On Track' },
      { id: `g-${emp.id}-2`, title: 'Participate in team knowledge sharing', progress: 55, status: 'In Progress' },
    ],
    kpis: [
      { id: `k-${emp.id}-1`, label: 'Delivery', score: 4.0, target: 4.0 },
      { id: `k-${emp.id}-2`, label: 'Teamwork', score: 3.8, target: 4.0 },
      { id: `k-${emp.id}-3`, label: 'Communication', score: 4.1, target: 4.0 },
    ],
    reviews: [
      {
        id: `rev-${emp.id}-1`,
        period: 'H2 FY24',
        rating: isLead ? 4.2 : 3.9,
        reviewer: 'Manager',
        date: '2024-12-15',
        summary: `Solid performance in the ${emp.department} team during the review period.`,
      },
    ],
  };
}

export function getEmployeePerformance(emp) {
  if (emp.performance) return emp.performance;
  if (PERFORMANCE_OVERRIDES[emp.id]) {
    const data = PERFORMANCE_OVERRIDES[emp.id];
    const reviewerName =
      data.reviewer ||
      (emp.reportsToId
        ? HR_EMPLOYEES.find((e) => e.id === emp.reportsToId)?.name
        : 'Manager');
    return { ...data, reviewer: reviewerName };
  }
  const defaults = defaultPerformanceForRole(emp);
  if (emp.reportsToId) {
    const manager = HR_EMPLOYEES.find((e) => e.id === emp.reportsToId);
    if (manager) defaults.reviewer = manager.name;
  }
  return defaults;
}

export function getEmployeeAssets(emp) {
  if (Array.isArray(emp.assets)) return emp.assets;
  if (ASSET_OVERRIDES[emp.id]) return ASSET_OVERRIDES[emp.id];
  const assets = [
    {
      id: `ast-${emp.id}-lt`,
      name: emp.department === 'Design' ? 'MacBook Pro 16"' : 'MacBook Air',
      category: 'Laptop',
      serial: `LT-${emp.employeeId || emp.id}`,
      assetTag: `VW-LT-${emp.employeeId?.replace('EMP-', '') || '000'}`,
      assignedAt: emp.joinedAt,
      status: 'Assigned',
      value: 120000,
    },
  ];
  if (['Engineering', 'Design', 'Product'].includes(emp.department)) {
    assets.push({
      id: `ast-${emp.id}-mn`,
      name: '24" LED Monitor',
      category: 'Monitor',
      serial: `MN-${emp.employeeId || emp.id}`,
      assetTag: `VW-MN-${emp.employeeId?.replace('EMP-', '') || '000'}`,
      assignedAt: emp.joinedAt,
      status: 'Assigned',
      value: 18000,
    });
  }
  if (emp.department === 'Sales') {
    assets.push({
      id: `ast-${emp.id}-ph`,
      name: 'Company Mobile Phone',
      category: 'Phone',
      serial: `PH-${emp.employeeId || emp.id}`,
      assetTag: `VW-PH-${emp.employeeId?.replace('EMP-', '') || '000'}`,
      assignedAt: emp.joinedAt,
      status: 'Assigned',
      value: 45000,
    });
  }
  assets.push({
    id: `ast-${emp.id}-id`,
    name: 'Company ID Card',
    category: 'ID Card',
    serial: `ID-${emp.employeeId || emp.id}`,
    assetTag: `VW-ID-${emp.employeeId?.replace('EMP-', '') || '000'}`,
    assignedAt: emp.joinedAt,
    status: 'Assigned',
    value: 0,
  });
  return assets;
}

export const PENDING_APPROVALS = [
  {
    id: 'pa1',
    employeeId: 'he1',
    employee: 'John Doe',
    ini: 'JD',
    department: 'Engineering',
    type: 'leave',
    action: 'Leave approval',
    details: 'Casual leave — 3 days (Jun 12–14, 2025)',
    submittedAt: '2025-06-08',
    urgency: 'urgent',
    due: 'Today',
    status: 'pending',
  },
  {
    id: 'pa2',
    employeeId: 'he4',
    employee: 'Sarah Johnson',
    ini: 'SJ',
    department: 'Product',
    type: 'review',
    action: 'Performance review sign-off',
    details: 'Q2 2025 self-assessment pending manager approval',
    submittedAt: '2025-06-06',
    urgency: '',
    due: '2 days',
    status: 'pending',
  },
  {
    id: 'pa3',
    employeeId: 'he5',
    employee: 'Michael Chen',
    ini: 'MC',
    department: 'Engineering',
    type: 'document',
    action: 'Document verification',
    details: 'Updated address proof — Aadhaar card resubmission',
    submittedAt: '2025-06-09',
    urgency: 'urgent',
    due: 'Today',
    status: 'pending',
  },
  {
    id: 'pa4',
    employeeId: 'he10',
    employee: 'Lisa Anderson',
    ini: 'LA',
    department: 'Design',
    type: 'leave',
    action: 'Leave approval',
    details: 'Earned leave — 5 days (Jun 16–20, 2025)',
    submittedAt: '2025-06-05',
    urgency: '',
    due: '3 days',
    status: 'pending',
  },
  {
    id: 'pa5',
    employeeId: 'he11',
    employee: 'James Wilson',
    ini: 'JW',
    department: 'Finance',
    type: 'expense',
    action: 'Expense reimbursement',
    details: 'Client dinner reimbursement — ₹4,850',
    submittedAt: '2025-06-07',
    urgency: '',
    due: '4 days',
    status: 'pending',
  },
  {
    id: 'pa6',
    employeeId: 'he3',
    employee: 'Alice Brown',
    ini: 'AB',
    department: 'HR & Admin',
    type: 'document',
    action: 'Policy acknowledgment',
    details: 'Remote work policy v2.1 — pending acknowledgment',
    submittedAt: '2025-06-01',
    urgency: '',
    due: '1 week',
    status: 'pending',
  },
  {
    id: 'pa7',
    employeeId: 'he7',
    employee: 'David Lee',
    ini: 'DL',
    department: 'Engineering',
    type: 'leave',
    action: 'Leave approval',
    details: 'Sick leave — 1 day (Jun 10, 2025)',
    submittedAt: '2025-06-09',
    urgency: 'urgent',
    due: 'Today',
    status: 'approved',
    resolvedAt: '2025-06-09',
  },
];

export const HIKE_REVIEW_CYCLE = 'FY2025';

export const HIKE_WORKFLOWS = [];

export const EMPLOYEE_HIKES = [
  {
    id: 'hk1',
    employeeId: 'he5',
    employee: 'Michael Chen',
    ini: 'MC',
    department: 'Engineering',
    role: 'Software Engineer',
    currentSalary: 1440000,
    proposedSalary: 1620000,
    hikePercent: 12.5,
    effectiveDate: '2025-07-01',
    reason: 'Annual performance review — exceeds expectations',
    cycle: 'FY2025',
    status: 'pending',
    submittedAt: '2025-06-01',
    submittedBy: 'Jane Smith',
  },
  {
    id: 'hk2',
    employeeId: 'he1',
    employee: 'John Doe',
    ini: 'JD',
    department: 'Engineering',
    role: 'Senior Software Engineer',
    currentSalary: 1800000,
    proposedSalary: 1980000,
    hikePercent: 10,
    effectiveDate: '2025-07-01',
    reason: 'Annual increment — strong delivery on platform APIs',
    cycle: 'FY2025',
    status: 'pending',
    submittedAt: '2025-06-02',
    submittedBy: 'Jane Smith',
  },
  {
    id: 'hk3',
    employeeId: 'he4',
    employee: 'Sarah Johnson',
    ini: 'SJ',
    department: 'Product',
    role: 'Senior Product Manager',
    currentSalary: 1680000,
    proposedSalary: 1848000,
    hikePercent: 10,
    effectiveDate: '2025-07-01',
    reason: 'Promotion to Senior PM — expanded scope',
    cycle: 'FY2025',
    status: 'approved',
    submittedAt: '2025-05-28',
    submittedBy: 'Robert Taylor',
    resolvedAt: '2025-06-03',
  },
  {
    id: 'hk4',
    employeeId: 'he8',
    employee: 'Priya Sharma',
    ini: 'PS',
    department: 'Product',
    role: 'Product Lead',
    currentSalary: 1920000,
    proposedSalary: 2208000,
    hikePercent: 15,
    effectiveDate: '2025-07-01',
    reason: 'Retention hike — critical product leadership role',
    cycle: 'FY2025',
    status: 'pending',
    submittedAt: '2025-06-04',
    submittedBy: 'Robert Taylor',
  },
  {
    id: 'hk5',
    employeeId: 'he6',
    employee: 'Emma Wilson',
    ini: 'EW',
    department: 'Marketing',
    role: 'Marketing Manager',
    currentSalary: 1320000,
    proposedSalary: 1452000,
    hikePercent: 10,
    effectiveDate: '2025-07-01',
    reason: 'Annual increment — campaign performance above target',
    cycle: 'FY2025',
    status: 'pending',
    submittedAt: '2025-06-05',
    submittedBy: 'Alice Brown',
  },
  {
    id: 'hk6',
    employeeId: 'he12',
    employee: 'Maria Garcia',
    ini: 'MG',
    department: 'Operations',
    role: 'Operations Manager',
    currentSalary: 1080000,
    proposedSalary: 1188000,
    hikePercent: 10,
    effectiveDate: '2025-07-01',
    reason: 'Contract-to-permanent conversion hike',
    cycle: 'FY2025',
    status: 'rejected',
    submittedAt: '2025-05-20',
    submittedBy: 'Alice Brown',
    resolvedAt: '2025-05-25',
    rejectionNote: 'Deferred until contract renewal in Q3',
  },
];

export const DEFAULT_PORTAL_EMPLOYEE_ID = 'he1';

export const ASSET_TICKET_TYPES = [
  { id: 'new', label: 'New asset request' },
  { id: 'replacement', label: 'Replacement' },
  { id: 'repair', label: 'Repair' },
  { id: 'return', label: 'Return asset' },
];

export const ASSET_TICKET_CATEGORIES = [
  'Laptop',
  'Monitor',
  'Phone',
  'Tablet',
  'Accessories',
  'ID Card',
  'Other',
];

export const ASSET_TICKETS = [
  {
    id: 'at1',
    ticketNo: 'AST-1042',
    employeeId: 'he1',
    employee: 'John Doe',
    ini: 'JD',
    type: 'replacement',
    category: 'Laptop',
    subject: 'Laptop battery not holding charge',
    description:
      'MacBook Air battery drains within 2 hours on normal use. Requesting a replacement unit before project deadline.',
    priority: 'high',
    status: 'in-progress',
    relatedAssetId: 'ast-he1-lt',
    relatedAssetName: 'MacBook Air',
    createdAt: '2025-06-05',
    updatedAt: '2025-06-08',
    assignedTo: 'IT Support',
  },
  {
    id: 'at2',
    ticketNo: 'AST-1038',
    employeeId: 'he1',
    employee: 'John Doe',
    ini: 'JD',
    type: 'new',
    category: 'Monitor',
    subject: 'Second monitor for home office setup',
    description: 'Need an additional 24" monitor for dual-screen setup while working from home twice a week.',
    priority: 'medium',
    status: 'open',
    relatedAssetId: '',
    relatedAssetName: '',
    createdAt: '2025-06-09',
    updatedAt: '2025-06-09',
    assignedTo: '',
  },
  {
    id: 'at3',
    ticketNo: 'AST-1021',
    employeeId: 'he1',
    employee: 'John Doe',
    ini: 'JD',
    type: 'repair',
    category: 'Accessories',
    subject: 'Wireless mouse scroll wheel stuck',
    description: 'Logitech mouse scroll wheel intermittently stops responding. Repair or replace please.',
    priority: 'low',
    status: 'resolved',
    relatedAssetId: '',
    relatedAssetName: 'Logitech MX Master',
    createdAt: '2025-05-20',
    updatedAt: '2025-05-28',
    assignedTo: 'IT Support',
    resolution: 'Replaced with new unit from inventory.',
  },
  {
    id: 'at4',
    ticketNo: 'AST-1015',
    employeeId: 'he5',
    employee: 'Michael Chen',
    ini: 'MC',
    type: 'new',
    category: 'Laptop',
    subject: 'Upgrade to higher-spec laptop',
    description: 'Current MacBook Air struggles with local Docker workloads. Request MacBook Pro 14".',
    priority: 'medium',
    status: 'open',
    relatedAssetId: 'ast-he5-lt',
    relatedAssetName: 'MacBook Air',
    createdAt: '2025-06-07',
    updatedAt: '2025-06-07',
    assignedTo: '',
  },
];

export const AI_TOOLS = [
  { id: 'cursor-pro', name: 'Cursor', vendor: 'Cursor', plan: 'Pro', monthlyCostInr: 1700, billingCycle: 'monthly', category: 'IDE' },
  { id: 'claude-pro', name: 'Claude', vendor: 'Anthropic', plan: 'Pro', monthlyCostInr: 1700, billingCycle: 'monthly', category: 'Assistant' },
  { id: 'claude-team', name: 'Claude', vendor: 'Anthropic', plan: 'Team', monthlyCostInr: 2500, billingCycle: 'monthly', category: 'Assistant' },
  { id: 'chatgpt-plus', name: 'ChatGPT', vendor: 'OpenAI', plan: 'Plus', monthlyCostInr: 1700, billingCycle: 'monthly', category: 'Assistant' },
  { id: 'chatgpt-team', name: 'ChatGPT', vendor: 'OpenAI', plan: 'Team', monthlyCostInr: 2100, billingCycle: 'monthly', category: 'Assistant' },
  { id: 'openai-api', name: 'OpenAI API', vendor: 'OpenAI', plan: 'Pay-as-you-go', monthlyCostInr: 2500, billingCycle: 'monthly', category: 'API' },
  { id: 'anthropic-api', name: 'Anthropic API', vendor: 'Anthropic', plan: 'Pay-as-you-go', monthlyCostInr: 3000, billingCycle: 'monthly', category: 'API' },
  { id: 'gemini-advanced', name: 'Gemini', vendor: 'Google', plan: 'Advanced', monthlyCostInr: 1950, billingCycle: 'monthly', category: 'Assistant' },
  { id: 'v0-premium', name: 'v0', vendor: 'Vercel', plan: 'Premium', monthlyCostInr: 1700, billingCycle: 'monthly', category: 'Design' },
  { id: 'github-copilot', name: 'GitHub Copilot', vendor: 'GitHub', plan: 'Individual', monthlyCostInr: 850, billingCycle: 'monthly', category: 'IDE' },
];

export const AI_SUBSCRIPTION_REQUESTS = [
  {
    id: 'air1',
    requestNo: 'AI-1041',
    employeeId: 'he1',
    employee: 'John Doe',
    ini: 'JD',
    department: 'Engineering',
    toolId: 'v0-premium',
    toolName: 'v0',
    vendor: 'Vercel',
    plan: 'Premium',
    monthlyCostInr: 1700,
    billingCycle: 'monthly',
    reason: 'Need v0 Premium for rapid UI prototyping on the ALM finance module redesign.',
    status: 'pending',
    createdAt: '2025-06-10',
    updatedAt: '2025-06-10',
    reviewedAt: '',
    reviewedBy: '',
    hrNotes: '',
    rejectionReason: '',
    subscriptionId: '',
  },
  {
    id: 'air2',
    requestNo: 'AI-1035',
    employeeId: 'he5',
    employee: 'Michael Chen',
    ini: 'MC',
    department: 'Engineering',
    toolId: 'gemini-advanced',
    toolName: 'Gemini',
    vendor: 'Google',
    plan: 'Advanced',
    monthlyCostInr: 1950,
    billingCycle: 'monthly',
    reason: 'Comparing Gemini Advanced for code review workflows alongside existing tools.',
    status: 'pending',
    createdAt: '2025-06-08',
    updatedAt: '2025-06-08',
    reviewedAt: '',
    reviewedBy: '',
    hrNotes: '',
    rejectionReason: '',
    subscriptionId: '',
  },
  {
    id: 'air3',
    requestNo: 'AI-1028',
    employeeId: 'he1',
    employee: 'John Doe',
    ini: 'JD',
    department: 'Engineering',
    toolId: 'cursor-pro',
    toolName: 'Cursor',
    vendor: 'Cursor',
    plan: 'Pro',
    monthlyCostInr: 1700,
    billingCycle: 'monthly',
    reason: 'Primary IDE for daily development — pair programming with AI assistance.',
    status: 'approved',
    createdAt: '2025-05-15',
    updatedAt: '2025-05-16',
    reviewedAt: '2025-05-16',
    reviewedBy: 'HR Admin',
    hrNotes: 'Provisioned under Engineering tooling budget.',
    rejectionReason: '',
    subscriptionId: 'ais1',
  },
  {
    id: 'air4',
    requestNo: 'AI-1020',
    employeeId: 'he10',
    employee: 'Lisa Anderson',
    ini: 'LA',
    department: 'Design',
    toolId: 'chatgpt-plus',
    toolName: 'ChatGPT',
    vendor: 'OpenAI',
    plan: 'Plus',
    monthlyCostInr: 1700,
    billingCycle: 'monthly',
    reason: 'UX copy exploration and design critique workflows.',
    status: 'rejected',
    createdAt: '2025-05-20',
    updatedAt: '2025-05-22',
    reviewedAt: '2025-05-22',
    reviewedBy: 'HR Admin',
    hrNotes: 'Design team already has shared ChatGPT Team seat.',
    rejectionReason: 'Use the shared Design team ChatGPT Team license instead of an individual Plus plan.',
    subscriptionId: '',
  },
];

export const AI_ACTIVE_SUBSCRIPTIONS = [
  {
    id: 'ais1',
    employeeId: 'he1',
    employee: 'John Doe',
    ini: 'JD',
    department: 'Engineering',
    toolId: 'cursor-pro',
    toolName: 'Cursor',
    vendor: 'Cursor',
    plan: 'Pro',
    monthlyCostInr: 1700,
    billingCycle: 'monthly',
    status: 'active',
    startDate: '2025-05-16',
    endDate: '',
    requestId: 'air3',
    licenseEmail: 'john.doe@voltuswave.io',
    notes: 'Engineering standard IDE subscription',
  },
  {
    id: 'ais2',
    employeeId: 'he1',
    employee: 'John Doe',
    ini: 'JD',
    department: 'Engineering',
    toolId: 'claude-pro',
    toolName: 'Claude',
    vendor: 'Anthropic',
    plan: 'Pro',
    monthlyCostInr: 1700,
    billingCycle: 'monthly',
    status: 'active',
    startDate: '2025-04-01',
    endDate: '',
    requestId: '',
    licenseEmail: 'john.doe@voltuswave.io',
    notes: 'Architecture reviews and documentation',
  },
  {
    id: 'ais3',
    employeeId: 'he2',
    employee: 'Jane Smith',
    ini: 'JS',
    department: 'Engineering',
    toolId: 'chatgpt-team',
    toolName: 'ChatGPT',
    vendor: 'OpenAI',
    plan: 'Team',
    monthlyCostInr: 2100,
    billingCycle: 'monthly',
    status: 'active',
    startDate: '2025-03-01',
    endDate: '',
    requestId: '',
    licenseEmail: 'jane.smith@voltuswave.io',
    notes: 'Tech lead — team collaboration features',
  },
  {
    id: 'ais4',
    employeeId: 'he2',
    employee: 'Jane Smith',
    ini: 'JS',
    department: 'Engineering',
    toolId: 'cursor-pro',
    toolName: 'Cursor',
    vendor: 'Cursor',
    plan: 'Pro',
    monthlyCostInr: 1700,
    billingCycle: 'monthly',
    status: 'active',
    startDate: '2025-02-15',
    endDate: '',
    requestId: '',
    licenseEmail: 'jane.smith@voltuswave.io',
    notes: '',
  },
  {
    id: 'ais5',
    employeeId: 'he3',
    employee: 'Alice Brown',
    ini: 'AB',
    department: 'HR & Admin',
    toolId: 'openai-api',
    toolName: 'OpenAI API',
    vendor: 'OpenAI',
    plan: 'Pay-as-you-go',
    monthlyCostInr: 3200,
    billingCycle: 'monthly',
    status: 'active',
    startDate: '2025-05-01',
    endDate: '',
    requestId: '',
    licenseEmail: 'alice.brown@voltuswave.io',
    notes: 'Internal tooling — avg usage ₹3,200/mo',
  },
  {
    id: 'ais6',
    employeeId: 'he8',
    employee: 'Priya Sharma',
    ini: 'PS',
    department: 'Product',
    toolId: 'claude-pro',
    toolName: 'Claude',
    vendor: 'Anthropic',
    plan: 'Pro',
    monthlyCostInr: 1700,
    billingCycle: 'monthly',
    status: 'active',
    startDate: '2025-06-01',
    endDate: '',
    requestId: '',
    licenseEmail: 'priya.sharma@voltuswave.io',
    notes: 'PRD drafting and competitive analysis',
  },
  {
    id: 'ais7',
    employeeId: 'he10',
    employee: 'Lisa Anderson',
    ini: 'LA',
    department: 'Design',
    toolId: 'v0-premium',
    toolName: 'v0',
    vendor: 'Vercel',
    plan: 'Premium',
    monthlyCostInr: 1700,
    billingCycle: 'monthly',
    status: 'active',
    startDate: '2025-04-10',
    endDate: '',
    requestId: '',
    licenseEmail: 'lisa.anderson@voltuswave.io',
    notes: 'UI component generation for design system',
  },
  {
    id: 'ais8',
    employeeId: 'he5',
    employee: 'Michael Chen',
    ini: 'MC',
    department: 'Engineering',
    toolId: 'github-copilot',
    toolName: 'GitHub Copilot',
    vendor: 'GitHub',
    plan: 'Individual',
    monthlyCostInr: 850,
    billingCycle: 'monthly',
    status: 'active',
    startDate: '2025-05-20',
    endDate: '',
    requestId: '',
    licenseEmail: 'michael.chen@voltuswave.io',
    notes: '',
  },
];

export function findAiTool(toolId) {
  return AI_TOOLS.find((t) => t.id === toolId);
}

export const EXIT_REASONS = [
  'Better opportunity',
  'Relocation',
  'Personal reasons',
  'Higher studies',
  'Career change',
  'Health reasons',
  'Other',
];

export const EXIT_REQUESTS = [
  {
    id: 'ex1',
    ticketNo: 'EXT-1001',
    employeeId: 'he12',
    employee: 'Maria Garcia',
    ini: 'MG',
    department: 'Operations',
    role: 'Operations Manager',
    email: 'maria.garcia@voltuswave.io',
    reason: 'Relocation to another city',
    lastWorkingDay: '2025-07-15',
    noticePeriodDays: 30,
    status: 'approved',
    submittedAt: '2025-06-01',
    approvedAt: '2025-06-05',
    assignedAssetsCount: 3,
    assetsSubmitted: false,
    assetsSubmittedAt: null,
    assetsReturnedCount: 0,
    hrNotes: '',
    clearedBy: '',
  },
];

export const HR_DASHBOARD_STATS = {
  totalEmployees: 150,
  onLeaveToday: 8,
  newHiresThisMonth: 5,
  pendingApprovals: 20,
  turnoverRate: 4.2,
  openPositions: 8,
  avgTimeToHire: 45,
  employeeSatisfaction: 8.2,
  trainingHours: 240,
};
