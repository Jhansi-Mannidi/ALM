export const USERS = [
  {id:'u1',name:'Raj Kumar',ini:'RK',role:'manager',email:'raj.kumar@almsphere.io',c:'c1',tasks:12,bugs:2,ontime:97,status:'Active',reportsTo:'u0'},
  {id:'u2',name:'Priya Sharma',ini:'PS',role:'teamlead',email:'priya.sharma@almsphere.io',c:'c2',tasks:9,bugs:1,ontime:94,status:'Active',reportsTo:'u1'},
  {id:'u3',name:'Arjun Mehta',ini:'AM',role:'developer',email:'arjun.mehta@almsphere.io',c:'c3',tasks:7,bugs:3,ontime:88,status:'Active',reportsTo:'u2'},
  {id:'u4',name:'Sneha Rao',ini:'SR',role:'developer',email:'sneha.rao@almsphere.io',c:'c4',tasks:11,bugs:0,ontime:96,status:'Active',reportsTo:'u2'},
  {id:'u5',name:'Kiran Patel',ini:'KP',role:'developer',email:'kiran.patel@almsphere.io',c:'c5',tasks:6,bugs:1,ontime:100,status:'Active',reportsTo:'u2'},
  {id:'u6',name:'Nisha Verma',ini:'NV',role:'developer',email:'nisha.verma@almsphere.io',c:'c6',tasks:8,bugs:2,ontime:91,status:'Active',reportsTo:'u2'},
  {id:'u7',name:'Vikram Gupta',ini:'VG',role:'developer',email:'vikram.gupta@almsphere.io',c:'c7',tasks:5,bugs:0,ontime:100,status:'Active',reportsTo:'u2'},
  {id:'u8',name:'Lakshmi M.',ini:'LM',role:'developer',email:'lakshmi.m@almsphere.io',c:'c8',tasks:4,bugs:0,ontime:95,status:'Active',reportsTo:'u2'},
  {id:'u9',name:'Ananya Iyer',ini:'AI',role:'tester',email:'ananya.iyer@almsphere.io',c:'c1',tasks:10,bugs:4,ontime:93,status:'Active',reportsTo:'u2'},
  {id:'u10',name:'Rohit Singh',ini:'RS',role:'tester',email:'rohit.singh@almsphere.io',c:'c2',tasks:8,bugs:5,ontime:90,status:'Active',reportsTo:'u2'},
  {id:'u11',name:'Meera Joshi',ini:'MJ',role:'scrummaster',email:'meera.joshi@almsphere.io',c:'c3',tasks:6,bugs:1,ontime:98,status:'Active',reportsTo:'u1'},
  {id:'u12',name:'Karan Desai',ini:'KD',role:'developer',email:'karan.desai@almsphere.io',c:'c4',tasks:5,bugs:0,ontime:92,status:'Active',reportsTo:'u2'},
  {id:'u13',name:'Divya Nair',ini:'DN',role:'developer',email:'divya.nair@almsphere.io',c:'c5',tasks:7,bugs:1,ontime:89,status:'Active',reportsTo:'u2'},
  {id:'u14',name:'Isha Reddy',ini:'IR',role:'ba',email:'isha.reddy@almsphere.io',c:'c6',tasks:4,bugs:0,ontime:96,status:'Active',reportsTo:'u1'},
];

export const ROLE_USERS = {
  admin:{id:'u0',name:'Sasi Paul',ini:'SP',role:'admin',email:'sasi.paul@almsphere.io',c:'c1'},
  manager:USERS[0],
  teamlead:USERS[1],
  developer:USERS[2],
  tester:USERS[8],
  ba:USERS[13],
  scrummaster:USERS[10],
};

export let PROJECTS = [
  {
    id:'p1',name:'Phoenix Platform v3.0',clientName:'VoltusWave Corp',code:'PHXN',color:'#2563EB',
    status:'ontrack',phase:'development',progress:68,health:82,
    desc:'Core platform rebuild with modern microservices architecture',
    start:'2025-01-15',end:'2025-12-31',spDur:'2 weeks',
    curSprint:7,totalSprints:12,
    method:'Scrum',pm:'Raj Kumar',teamLead:'Priya Sharma',teamLeadId:'u2',
    scopeDocs:[
      {name:'Phoenix-BRD-v3.pdf',size:245760,added:'2025-01-10',content:'Business Requirements Document — Phoenix Platform v3.0\n\n1. Microservices migration\n2. OAuth 2.0 / SAML auth\n3. Real-time dashboard\n4. PCI-DSS payment module'},
      {name:'Phoenix-FRD-Auth.docx',size:184320,added:'2025-01-12',content:'Functional Requirements — Authentication Module\n\nFR-001 OAuth 2.0\nFR-002 RBAC\nFR-003 Session management'},
    ],
    members:['u1','u2','u3','u4','u5','u6','u7','u8','u9','u10','u11','u12','u13','u14'],
    spGoal:'Complete Auth module hardening and API rate limiting',
    sprints:[
      {num:5,name:'Sprint 5',start:'Jun 2',end:'Jun 13',status:'done'},
      {num:6,name:'Sprint 6',start:'Jun 16',end:'Jun 27',status:'done'},
      {num:7,name:'Sprint 7',start:'Jun 30',end:'Jul 11',status:'active'},
      {num:8,name:'Sprint 8',start:'Jul 14',end:'Jul 25',status:'planned'},
    ],
    issues:[
      {id:'PHXN-284',title:'Implement OAuth 2.0 refresh token rotation',type:'Feature',prio:'High',status:'Done',assign:'u2',sprint:'Sprint 7',due:'2025-07-08'},
      {id:'PHXN-283',title:'Dashboard widget lazy loading',type:'Feature',prio:'Medium',status:'In Review',assign:'u6',sprint:'Sprint 7',due:'2025-07-10'},
      {id:'PHXN-279',title:'Payment gateway timeout on high load',type:'Bug',prio:'Critical',status:'In Progress',assign:'u3',sprint:'Sprint 7',due:'2025-07-07'},
      {id:'PHXN-275',title:'API rate limiting middleware',type:'Feature',prio:'High',status:'In Progress',assign:'u2',sprint:'Sprint 7',due:'2025-07-09'},
      {id:'PHXN-271',title:'Database index optimization for reports',type:'Task',prio:'Medium',status:'Blocked',assign:'u3',sprint:'Sprint 7',due:'2025-07-09'},
      {id:'PHXN-268',title:'Mobile responsive nav breakpoints',type:'Feature',prio:'Low',status:'To Do',assign:'u6',sprint:'Sprint 8',due:'2025-07-18'},
      {id:'PHXN-261',title:'CI/CD pipeline node_modules cache',type:'Task',prio:'Medium',status:'To Do',assign:'u5',sprint:'Sprint 8',due:'2025-07-20'},
      {id:'PHXN-254',title:'User preference persistence on logout',type:'Bug',prio:'High',status:'To Do',assign:'u4',sprint:'Backlog',due:'2025-07-25'},
      {id:'PHXN-247',title:'WebSocket reconnect strategy',type:'Feature',prio:'Medium',status:'Code Review',assign:'u2',sprint:'Sprint 7',due:'2025-07-10'},
      {id:'PHXN-241',title:'Auth token rotation regression suite',type:'Task',prio:'High',status:'Testing',assign:'u4',sprint:'Sprint 7',due:'2025-07-11'},
      {id:'PHXN-238',title:'Load test: 500 concurrent users',type:'Task',prio:'Medium',status:'Testing',assign:'u4',sprint:'Sprint 7',due:'2025-07-11'},
      {id:'PHXN-229',title:'Audit logging for admin actions',type:'Feature',prio:'Medium',status:'Done',assign:'u2',sprint:'Sprint 7',due:'2025-07-05'},
      {id:'PHXN-305',title:'Approve production deployment window',type:'Task',prio:'Critical',status:'To Do',assign:'u0',sprint:'Sprint 7',due:'2025-07-10'},
      {id:'PHXN-306',title:'Stakeholder status deck preparation',type:'Task',prio:'High',status:'In Progress',assign:'u0',sprint:'Sprint 7',due:'2025-07-09'},
      {id:'PHXN-307',title:'Review Q3 release checklist',type:'Task',prio:'High',status:'To Do',assign:'u0',sprint:'Sprint 7',due:'2025-07-11'},
      {id:'PHXN-308',title:'Update client communication plan',type:'Task',prio:'Medium',status:'To Do',assign:'u0',sprint:'Sprint 7',due:'2025-07-12'},
    ],
    bugs:[
      {id:'BUG-041',title:'Payment double-charge on retry',description:'Retry payment after timeout creates duplicate charge. Reproduced on staging with card ending 4242.',url:'https://staging.phxn.io/checkout',dueTime:'2025-07-12T17:00',message:'Escalate to payments squad before Friday deploy.',sev:'Critical',prio:'Critical',status:'In Progress',assign:'u3',reported:'Jul 7',linked:'PHXN-279',postpones:true},
      {id:'BUG-039',title:'Report export hangs on large dataset',description:'Export >50k rows never completes. Browser tab freezes after 2 minutes.',url:'https://staging.phxn.io/reports/export',dueTime:'2025-07-14T12:00',message:'QA blocked on regression suite.',sev:'High',prio:'High',status:'In Progress',assign:'u6',reported:'Jul 6',linked:'PHXN-271',postpones:false},
      {id:'BUG-037',title:'Email notification delay > 10 min',sev:'Medium',prio:'Medium',status:'Open',assign:'u4',reported:'Jul 5',linked:'',postpones:false},
      {id:'BUG-035',title:'CSV import fails with BOM character',sev:'Low',prio:'Low',status:'Open',assign:'u3',reported:'Jul 4',linked:'',postpones:false},
      {id:'BUG-033',title:'Session token not invalidated on password reset',sev:'Critical',prio:'Critical',status:'Resolved',assign:'u2',reported:'Jul 2',linked:'PHXN-284',postpones:false},
    ],
    testScenarios:[
      {id:'TS-001',title:'User signs in with OAuth and lands on dashboard',prio:'High',status:'Active'},
      {id:'TS-002',title:'Admin assigns role and permissions propagate within 30s',prio:'High',status:'Active'},
      {id:'TS-003',title:'Payment retry does not double-charge the customer',prio:'Critical',status:'In Review'},
      {id:'TS-004',title:'Report export completes for 50k row dataset',prio:'Medium',status:'Draft'},
    ],
    developerScope:{
      mockUrl:'https://phxn-mock.almsphere.io',
      uiUxUrl:'https://www.figma.com/file/phoenix-platform-v3',
      techStack:['React 18','TypeScript','Node.js 20','PostgreSQL 16','Redis','Docker','Kubernetes','GraphQL'],
      linksMeta:{updatedBy:'u2',updatedByName:'Priya Sharma',updatedAt:'2025-06-20'},
      techStackMeta:{updatedBy:'u2',updatedByName:'Priya Sharma',updatedAt:'2025-06-22'},
    },
    scopeSheets:{
      client:[
        {id:'scs-p1-c1',title:'BRD Sign-off v3',description:'Signed business requirements for Phoenix v3 platform rebuild',date:'2025-01-10',name:'Phoenix-BRD-v3.pdf',size:312000},
        {id:'scs-p1-c2',title:'Client Requirements Pack',description:'Consolidated client scope and acceptance criteria',date:'2025-01-12',name:'Phoenix-Client-Requirements.pdf',size:428000},
        {id:'scs-p1-c3',title:'FRD — Auth Module',description:'Functional requirements for OAuth, SAML and session management',date:'2025-01-15',name:'Phoenix-FRD-Auth.xlsx',size:184320},
      ],
      tester:[
        {id:'scs-p1-t1',title:'QA Test Scope v3',description:'Overall test scope and coverage for Sprint 7',date:'2025-06-15',name:'Phoenix-Test-Scope.pdf',size:156000,addedBy:'u9',addedByName:'Ananya Iyer'},
        {id:'scs-p1-t2',title:'Auth Regression Matrix',description:'Regression cases for authentication flows',date:'2025-06-18',name:'Phoenix-Auth-Tests.xlsx',size:98304,addedBy:'u9',addedByName:'Ananya Iyer'},
        {id:'scs-p1-t3',title:'Payment QA Scenarios',description:'End-to-end payment and retry scenarios',date:'2025-07-01',name:'Phoenix-Payment-QA.xlsx',size:112640,addedBy:'u9',addedByName:'Ananya Iyer'},
      ],
      developer:[
        {id:'scs-p1-d1',title:'Sprint 7 Feature List',description:'Developer feature breakdown for current sprint',date:'2025-06-28',name:'Phoenix-Features-S7.xlsx',size:65536},
        {id:'scs-p1-d2',title:'API Endpoints Spec',description:'REST and GraphQL endpoints for v3 services',date:'2025-07-03',name:'Phoenix-API-Spec.xlsx',size:81920},
      ],
    },
    testCases:[
      {id:'TC-1041',suite:'Auth Suite',scene:'Verify OAuth token refresh on expiry',type:'Automated',result:'Pass',assign:'u4',exec:'Jul 7',linked:'PHXN-284'},
      {id:'TC-1042',suite:'Auth Suite',scene:'Invalid token returns 401',type:'Automated',result:'Pass',assign:'u4',exec:'Jul 7',linked:'PHXN-284'},
      {id:'TC-1048',suite:'Payment',scene:'Successful payment with valid card',type:'Manual',result:'Fail',assign:'u4',exec:'Jul 6',linked:'PHXN-279'},
      {id:'TC-1049',suite:'Payment',scene:'Gateway timeout at 1000 concurrent txns',type:'Load',result:'Fail',assign:'u4',exec:'Jul 6',linked:'PHXN-279'},
      {id:'TC-1055',suite:'Dashboard',scene:'Widget render < 2s on 3G',type:'Performance',result:'Pass',assign:'u4',exec:'Jul 7',linked:'PHXN-283'},
      {id:'TC-1060',suite:'API Suite',scene:'Rate limit headers in response',type:'Automated',result:'Skip',assign:'u4',exec:'Pending',linked:'PHXN-275'},
    ],
    requirements:{
      fr:[
        {id:'FR-001',title:'User authentication via OAuth 2.0 and SAML',prio:'Must Have',status:'Implemented'},
        {id:'FR-002',title:'Role-based access control with custom permissions',prio:'Must Have',status:'Implemented'},
        {id:'FR-007',title:'Real-time dashboard with WebSocket updates',prio:'Must Have',status:'In Progress'},
        {id:'FR-014',title:'Payment processing with PCI-DSS compliance',prio:'Must Have',status:'Planned'},
        {id:'FR-018',title:'Multi-language support (EN, HI, TE, TA)',prio:'Should Have',status:'Backlog'},
      ],
      nfr:[
        {id:'NFR-001',title:'API response ≤ 200ms at P99 under 1000 RPS',prio:'Must Have',status:'Measuring'},
        {id:'NFR-003',title:'System availability 99.9% SLA',prio:'Must Have',status:'Monitoring'},
        {id:'NFR-005',title:'Zero critical CVEs in production',prio:'Must Have',status:'Enforced'},
        {id:'NFR-008',title:'Horizontal scaling to 50k concurrent users',prio:'Should Have',status:'Planned'},
      ]
    },
    tickets:[
      {id:'SUP-441',title:'Payment double-charge edge case',prio:'P1',status:'In Progress',age:'6h'},
      {id:'SUP-439',title:'Report export hangs on large dataset',prio:'P2',status:'In Progress',age:'1d'},
      {id:'SUP-437',title:'Email notification delay',prio:'P3',status:'Open',age:'2d'},
    ],
    techDebt:[
      {id:'DEBT-12',title:'Migrate REST to GraphQL for nested queries',effort:'34 days',impact:'High',owner:'Priya'},
      {id:'DEBT-18',title:'Replace lodash with native ES2022',effort:'8 days',impact:'Medium',owner:'Nisha'},
      {id:'DEBT-21',title:'Upgrade React 17 → 18 concurrent features',effort:'13 days',impact:'High',owner:'Priya'},
    ],
    releases:[
      {id:'rel-p1-1',ver:'v2.8.7',date:'Jun 28',type:'Patch',changes:'3 bug fixes, security hardening',status:'Stable',by:'Kiran P.'},
      {id:'rel-p1-2',ver:'v2.8.0',date:'Jun 14',type:'Minor',changes:'Auth redesign, 12 features',status:'Stable',by:'Kiran P.'},
      {id:'rel-p1-3',ver:'v2.7.3',date:'May 30',type:'Patch',changes:'Performance: -30% API latency',status:'Stable',by:'Kiran P.'},
      {id:'rel-p1-4',ver:'v2.7.0',date:'May 12',type:'Minor',changes:'Dashboard widgets, export to CSV',status:'Stable',by:'Priya S.'},
      {id:'rel-p1-5',ver:'v2.6.2',date:'Apr 25',type:'Patch',changes:'Webhook retry logic, 2 CVE patches',status:'Stable',by:'Kiran P.'},
      {id:'rel-p1-6',ver:'v2.6.0',date:'Apr 8',type:'Minor',changes:'Role-based access control, audit logs',status:'Stable',by:'Raj Kumar'},
      {id:'rel-p1-7',ver:'v2.5.1',date:'Mar 20',type:'Patch',changes:'Fix session timeout, email template updates',status:'Stable',by:'Arjun M.'},
      {id:'rel-p1-8',ver:'v2.5.0',date:'Mar 5',type:'Minor',changes:'Notification center, Slack integration',status:'Stable',by:'Kiran P.'},
      {id:'rel-p1-9',ver:'v2.4.0',date:'Feb 14',type:'Minor',changes:'API v2 rollout, backward-compatible endpoints',status:'Stable',by:'Nisha R.'},
      {id:'rel-p1-10',ver:'v2.3.2',date:'Jan 28',type:'Patch',changes:'Database migration fixes, index optimization',status:'Stable',by:'Kiran P.'},
    ],
    credentials:[
      {id:'cred-p1-1',type:'database',name:'Database',notes:'Primary app database — read replicas on db-replica-01',updated:'Jul 5',fields:[
        {label:'Host',value:'db.phxn.internal',secret:false},
        {label:'Port',value:'5432',secret:false},
        {label:'Database',value:'phoenix_prod',secret:false},
        {label:'Username',value:'phxn_app',secret:false},
        {label:'Password',value:'PhxN!pr0d#2025',secret:true},
      ]},
      {id:'cred-p1-3',type:'lucidchart',name:'Lucid',notes:'Main architecture & sequence diagrams',updated:'Jun 20',fields:[
        {label:'URL',value:'https://lucid.app/lucidchart/abc123-phoenix-arch',secret:false},
        {label:'Email',value:'priya@almsphere.io',secret:false},
        {label:'Password',value:'Lucid!PhxN2025',secret:true},
      ]},
      {id:'cred-p1-4',type:'loom',name:'Loom Credentials',notes:'Weekly sprint review recordings folder',updated:'Jul 1',fields:[
        {label:'URL',value:'https://www.loom.com/share/phoenix-sprint-demos',secret:false},
        {label:'Email',value:'raj@almsphere.io',secret:false},
        {label:'Password',value:'Loom#PhxN2025',secret:true},
      ]},
    ],
    epics:[
      {name:'Auth & Security',stories:18,start:0,width:28,status:'done',color:'#059669'},
      {name:'Core API v2',stories:24,start:14,width:35,status:'active',color:'#2563EB'},
      {name:'Dashboard UI',stories:16,start:20,width:25,status:'active',color:'#2563EB'},
      {name:'Payment Module',stories:12,start:37,width:25,status:'planned',color:'#D97706'},
      {name:'Reporting Engine',stories:9,start:50,width:22,status:'backlog',color:'#64748B'},
    ],
  },
  {
    id:'p2',name:'Nexus Mobile App',clientName:'RetailMax Inc.',code:'NXS',color:'#7C3AED',
    status:'delayed',phase:'ba',progress:34,health:58,
    desc:'Cross-platform mobile application for iOS and Android',
    start:'2025-03-01',end:'2025-11-30',spDur:'2 weeks',
    curSprint:4,totalSprints:10,
    method:'Scrum',pm:'Raj Kumar',teamLead:'Priya Sharma',teamLeadId:'u2',
    scopeDocs:[
      {name:'Nexus-Mobile-BRD.pdf',size:198400,added:'2025-03-05',content:'Business Requirements — Nexus Mobile App\n\nOffline sync, push notifications, biometric auth, iOS/Android parity.'},
      {name:'Nexus-UX-Scope.pdf',size:156672,added:'2025-03-08',content:'UX scope and screen inventory for Nexus mobile v1.'},
    ],
    members:['u1','u3','u5','u6','u7','u9','u10','u11','u14'],
    spGoal:'Complete offline sync and push notification integration',
    sprints:[
      {num:3,name:'Sprint 3',start:'May 19',end:'May 30',status:'done'},
      {num:4,name:'Sprint 4',start:'Jun 2',end:'Jun 13',status:'active'},
      {num:5,name:'Sprint 5',start:'Jun 16',end:'Jun 27',status:'planned'},
    ],
    issues:[
      {id:'NXS-089',title:'Offline data sync with conflict resolution',type:'Feature',prio:'Critical',status:'In Progress',assign:'u3',sprint:'Sprint 4',due:'2025-07-10'},
      {id:'NXS-087',title:'Push notification deep linking',type:'Feature',prio:'High',status:'To Do',assign:'u6',sprint:'Sprint 4',due:'2025-07-12'},
      {id:'NXS-082',title:'App crashes on Android 12 back gesture',type:'Bug',prio:'Critical',status:'In Progress',assign:'u5',sprint:'Sprint 4',due:'2025-07-08'},
      {id:'NXS-079',title:'Biometric authentication integration',type:'Feature',prio:'Medium',status:'Done',assign:'u6',sprint:'Sprint 4',due:'2025-07-05'},
      {id:'NXS-074',title:'App store assets and metadata',type:'Task',prio:'Low',status:'To Do',assign:'u7',sprint:'Sprint 5',due:'2025-07-20'},
      {id:'NXS-091',title:'Client demo dry run with RetailMax',type:'Task',prio:'High',status:'To Do',assign:'u0',sprint:'Sprint 4',due:'2025-07-11'},
    ],
    bugs:[
      {id:'BUG-N019',title:'App crashes on Android 12 back gesture',sev:'Critical',prio:'Critical',status:'In Progress',assign:'u5',reported:'Jul 5',linked:'NXS-082',postpones:true},
      {id:'BUG-N017',title:'Memory leak on long list scroll',sev:'High',prio:'High',status:'Open',assign:'u3',reported:'Jul 4',linked:'',postpones:false},
      {id:'BUG-N015',title:'Dark mode text contrast issue',sev:'Low',prio:'Low',status:'Open',assign:'u6',reported:'Jul 3',linked:'',postpones:false},
    ],
    testScenarios:[
      {id:'TS-N01',title:'User enables biometrics and unlocks app on cold start',prio:'High',status:'Active'},
      {id:'TS-N02',title:'Offline edits sync after airplane mode is disabled',prio:'Critical',status:'Active'},
      {id:'TS-N03',title:'Push notification opens correct deep link screen',prio:'Medium',status:'Draft'},
    ],
    developerScope:{
      mockUrl:'https://nxs-prototype.almsphere.io',
      uiUxUrl:'https://www.figma.com/file/nexus-mobile-flows',
      techStack:['React Native 0.73','TypeScript','Firebase','Postgres','Fastlane','Detox'],
      linksMeta:{updatedBy:'u3',updatedByName:'Rahul Mehta',updatedAt:'2025-05-18'},
      techStackMeta:{updatedBy:'u2',updatedByName:'Priya Sharma',updatedAt:'2025-05-20'},
    },
    scopeSheets:{
      client:[{id:'scs-p2-c1',title:'Mobile BRD',date:'2025-03-05',name:'Nexus-Mobile-BRD.xlsx',size:198400}],
      tester:[
        {id:'scs-p2-t1',title:'Mobile Test Scope',date:'2025-05-20',name:'Nexus-Test-Scope.pdf',size:142000,addedBy:'u9',addedByName:'Ananya Iyer'},
        {id:'scs-p2-t2',title:'Biometric Test Plan',date:'2025-05-22',name:'Nexus-Biometric-Tests.xlsx',size:76800,addedBy:'u9',addedByName:'Ananya Iyer'},
      ],
      developer:[{id:'scs-p2-d1',title:'Offline Sync Features',date:'2025-06-10',name:'Nexus-Features.xlsx',size:54272}],
    },
    testCases:[
      {id:'TC-N041',suite:'Core Suite',scene:'App launches under 2 seconds',type:'Performance',result:'Pass',assign:'u4',exec:'Jul 6',linked:''},
      {id:'TC-N042',suite:'Auth Suite',scene:'Biometric auth enrolls correctly',type:'Manual',result:'Pass',assign:'u4',exec:'Jul 6',linked:'NXS-079'},
      {id:'TC-N048',suite:'Sync Suite',scene:'Offline edits sync on reconnect',type:'Manual',result:'Fail',assign:'u4',exec:'Jul 7',linked:'NXS-089'},
    ],
    requirements:{
      fr:[
        {id:'FR-001',title:'Biometric authentication (FaceID / Fingerprint)',prio:'Must Have',status:'Implemented'},
        {id:'FR-002',title:'Offline-first data access and sync',prio:'Must Have',status:'In Progress'},
        {id:'FR-005',title:'Push notifications with deep linking',prio:'Must Have',status:'Planned'},
      ],
      nfr:[
        {id:'NFR-001',title:'App launch under 2s on mid-range device',prio:'Must Have',status:'Measuring'},
        {id:'NFR-002',title:'Crash-free rate > 99.5%',prio:'Must Have',status:'Monitoring'},
      ]
    },
    tickets:[
      {id:'SUP-M21',title:'App crash on Android 12',prio:'P1',status:'In Progress',age:'2d'},
      {id:'SUP-M19',title:'Push notifs not delivered on iOS 17',prio:'P2',status:'Open',age:'3d'},
    ],
    techDebt:[
      {id:'DEBT-M1',title:'Migrate to React Native 0.73',effort:'21 days',impact:'High',owner:'Arjun'},
      {id:'DEBT-M2',title:'Remove legacy AsyncStorage usage',effort:'8 days',impact:'Medium',owner:'Nisha'},
    ],
    releases:[
      {id:'rel-p2-1',ver:'v0.4.2',date:'Jun 20',type:'Beta',changes:'Biometric auth, 4 bug fixes',status:'Beta',by:'Kiran P.'},
      {id:'rel-p2-2',ver:'v0.3.0',date:'Jun 1',type:'Alpha',changes:'Core navigation, settings',status:'Deprecated',by:'Kiran P.'},
    ],
    credentials:[
      {id:'cred-p2-1',type:'database',name:'Mobile Backend DB',notes:'Firebase + Postgres hybrid',updated:'Jun 18',fields:[
        {label:'Host',value:'db.nxs.internal',secret:false},
        {label:'Port',value:'5432',secret:false},
        {label:'Database',value:'nexus_mobile',secret:false},
        {label:'Username',value:'nxs_api',secret:false},
        {label:'Password',value:'Nxs!M0b2025',secret:true},
      ]},
      {id:'cred-p2-2',type:'lucidchart',name:'Mobile UX Flows',notes:'',updated:'May 28',fields:[
        {label:'URL',value:'https://lucid.app/lucidchart/nxs-mobile-flows',secret:false},
        {label:'Email',value:'arjun@almsphere.io',secret:false},
        {label:'Password',value:'Lucid#Nxs2025',secret:true},
      ]},
      {id:'cred-p2-3',type:'loom',name:'QA Screen Recordings',notes:'',updated:'Jun 10',fields:[
        {label:'URL',value:'https://www.loom.com/share/nxs-qa-recordings',secret:false},
        {label:'Email',value:'nisha@almsphere.io',secret:false},
        {label:'Password',value:'Loom#Nxs2025',secret:true},
      ]},
    ],
    epics:[
      {name:'Core Navigation',stories:12,start:0,width:30,status:'done',color:'#059669'},
      {name:'Auth & Profile',stories:8,start:20,width:25,status:'done',color:'#059669'},
      {name:'Offline Sync',stories:14,start:35,width:35,status:'active',color:'#7C3AED'},
      {name:'Push & Notifications',stories:10,start:55,width:30,status:'planned',color:'#D97706'},
    ],
  },
  {
    id:'p3',name:'DataVault Analytics',clientName:'Insight Partners Ltd.',code:'DVA',color:'#0891B2',
    status:'ontrack',phase:'mock',progress:52,health:74,
    desc:'Enterprise analytics and reporting platform with AI insights',
    start:'2025-02-01',end:'2025-10-31',spDur:'2 weeks',
    curSprint:6,totalSprints:10,
    method:'Scrum',pm:'Raj Kumar',teamLead:'Priya Sharma',teamLeadId:'u2',
    scopeDocs:[
      {name:'DataVault-Mock-Scope.pdf',size:131072,added:'2025-02-05',content:'Mock scope — DataVault Analytics\n\nETL ingestion, dashboard builder, AI insight widgets, scheduled reports.'},
    ],
    members:['u1','u2','u4','u7','u8','u10','u12','u13'],
    spGoal:'Complete ETL pipeline and dashboard builder MVP',
    sprints:[
      {num:5,name:'Sprint 5',start:'Jun 9',end:'Jun 20',status:'done'},
      {num:6,name:'Sprint 6',start:'Jun 23',end:'Jul 4',status:'active'},
      {num:7,name:'Sprint 7',start:'Jul 7',end:'Jul 18',status:'planned'},
    ],
    issues:[
      {id:'DVA-121',title:'ETL pipeline for CSV and JSON ingestion',type:'Feature',prio:'High',status:'In Progress',assign:'u7',sprint:'Sprint 6',due:'2025-07-08'},
      {id:'DVA-118',title:'Drag-and-drop dashboard builder',type:'Feature',prio:'High',status:'Code Review',assign:'u2',sprint:'Sprint 6',due:'2025-07-10'},
      {id:'DVA-115',title:'Query result caching layer',type:'Feature',prio:'Medium',status:'Done',assign:'u7',sprint:'Sprint 6',due:'2025-07-04'},
      {id:'DVA-112',title:'Scheduled report delivery via email',type:'Feature',prio:'Medium',status:'To Do',assign:'u8',sprint:'Sprint 7',due:'2025-07-15'},
      {id:'DVA-109',title:'Incorrect aggregation on NULL fields',type:'Bug',prio:'High',status:'In Progress',assign:'u4',sprint:'Sprint 6',due:'2025-07-09'},
      {id:'DVA-125',title:'Sign off analytics dashboard mockups',type:'Task',prio:'High',status:'Code Review',assign:'u0',sprint:'Sprint 6',due:'2025-07-10'},
    ],
    bugs:[
      {id:'BUG-D12',title:'Incorrect aggregation on NULL fields',sev:'High',prio:'High',status:'In Progress',assign:'u4',reported:'Jul 5',linked:'DVA-109',postpones:false},
      {id:'BUG-D10',title:'Excel export missing decimal precision',sev:'Medium',prio:'Medium',status:'Open',assign:'u8',reported:'Jul 3',linked:'',postpones:false},
    ],
    testScenarios:[
      {id:'TS-D01',title:'Analyst builds dashboard from CSV upload to published view',prio:'High',status:'Active'},
      {id:'TS-D02',title:'Scheduled PDF report arrives in inbox on cron',prio:'Medium',status:'Draft'},
    ],
    developerScope:{
      mockUrl:'https://dva-mock.almsphere.io',
      uiUxUrl:'https://www.figma.com/file/datavault-dashboard-builder',
      techStack:['React 18','Python 3.12','ClickHouse','Apache Arrow','FastAPI','Celery','Redis'],
      linksMeta:{updatedBy:'u2',updatedByName:'Priya Sharma',updatedAt:'2025-06-01'},
      techStackMeta:{updatedBy:'u2',updatedByName:'Priya Sharma',updatedAt:'2025-06-03'},
    },
    scopeSheets:{
      client:[{id:'scs-p3-c1',title:'Analytics Scope',date:'2025-02-05',name:'DataVault-Scope.xlsx',size:131072}],
      tester:[
        {id:'scs-p3-t1',title:'Analytics Test Scope',date:'2025-06-01',name:'DataVault-Test-Scope.pdf',size:118000,addedBy:'u9',addedByName:'Ananya Iyer'},
        {id:'scs-p3-t2',title:'ETL Validation Sheet',date:'2025-06-05',name:'DataVault-ETL-Tests.xlsx',size:89088,addedBy:'u9',addedByName:'Ananya Iyer'},
      ],
      developer:[{id:'scs-p3-d1',title:'Dashboard Features v1',date:'2025-06-18',name:'DataVault-Features.xlsx',size:61440}],
    },
    testCases:[
      {id:'TC-D031',suite:'ETL Suite',scene:'Ingest 100k row CSV in under 30s',type:'Performance',result:'Pass',assign:'u4',exec:'Jul 6',linked:'DVA-121'},
      {id:'TC-D032',suite:'Dashboard',scene:'Drag widget updates chart correctly',type:'Manual',result:'Fail',assign:'u4',exec:'Jul 7',linked:'DVA-118'},
    ],
    requirements:{
      fr:[
        {id:'FR-001',title:'Multi-source data ingestion (CSV, JSON, DB)',prio:'Must Have',status:'In Progress'},
        {id:'FR-002',title:'Visual dashboard builder with 15+ chart types',prio:'Must Have',status:'In Progress'},
        {id:'FR-005',title:'Scheduled email reports with PDF export',prio:'Should Have',status:'Planned'},
      ],
      nfr:[
        {id:'NFR-001',title:'Query response < 3s for up to 10M rows',prio:'Must Have',status:'Measuring'},
        {id:'NFR-002',title:'500 concurrent dashboard viewers',prio:'Must Have',status:'Planned'},
      ]
    },
    tickets:[{id:'SUP-D11',title:'Dashboard timeout on large datasets',prio:'P2',status:'In Progress',age:'1d'}],
    techDebt:[{id:'DEBT-D1',title:'Migrate query engine to Apache Arrow',effort:'34 days',impact:'High',owner:'Vikram'}],
    releases:[{id:'rel-p3-1',ver:'v1.2.0',date:'Jun 22',type:'Minor',changes:'Caching layer, 6 new chart types',status:'Stable',by:'Kiran P.'}],
    credentials:[
      {id:'cred-p3-1',type:'database',name:'Analytics Warehouse',notes:'ClickHouse cluster for reporting',updated:'Jul 2',fields:[
        {label:'Host',value:'ch.dva.internal',secret:false},
        {label:'Port',value:'8123',secret:false},
        {label:'Database',value:'datavault_wh',secret:false},
        {label:'Username',value:'dva_etl',secret:false},
        {label:'Password',value:'Dva!WH2025',secret:true},
      ]},
      {id:'cred-p3-2',type:'lucidchart',name:'ETL Pipeline Diagrams',notes:'',updated:'Jun 15',fields:[
        {label:'URL',value:'https://lucid.app/lucidchart/dva-etl-pipelines',secret:false},
        {label:'Email',value:'vikram@almsphere.io',secret:false},
        {label:'Password',value:'Lucid#Dva2025',secret:true},
      ]},
    ],
    epics:[
      {name:'Data Ingestion',stories:14,start:0,width:35,status:'done',color:'#059669'},
      {name:'Query Engine',stories:18,start:25,width:30,status:'done',color:'#059669'},
      {name:'Dashboard Builder',stories:22,start:40,width:35,status:'active',color:'#0891B2'},
      {name:'AI Insights',stories:16,start:70,width:30,status:'planned',color:'#D97706'},
    ],
  }
];

export let NOTIFS = [
  {id:'n1',text:'<strong>Priya Sharma</strong> merged PR #284 — Auth module refactor',time:'12 min ago',read:false,type:'pr'},
  {id:'n2',text:'<strong>BUG-041</strong> Critical: Payment double-charge — assigned to Arjun',time:'1 hr ago',read:false,type:'bug'},
  {id:'n3',text:'<strong>Sneha Rao</strong> closed 3 bugs in payment module',time:'2 hrs ago',read:false,type:'bug'},
  {id:'n4',text:'<strong>Sprint 7</strong> is 70% through — 5 days remaining',time:'3 hrs ago',read:false,type:'sprint'},
  {id:'n5',text:'<strong>Kiran Patel</strong> deployed v2.9.1 to Staging',time:'5 hrs ago',read:true,type:'deploy'},
  {id:'n6',text:'Retro action: Set 24hr PR review SLA — due tomorrow',time:'Yesterday',read:true,type:'task'},
];

