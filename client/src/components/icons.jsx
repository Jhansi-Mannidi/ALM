import {
  AlertCircle,
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  BarChart2,
  BarChart3,
  Bell,
  Bug,
  Calendar,
  CalendarDays,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleAlert,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Code,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Flag,
  GanttChart,
  GraduationCap,
  GitPullRequest,
  KeyRound,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  List,
  ListChecks,
  Megaphone,
  Menu,
  MessageSquare,
  Monitor,
  Moon,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  Send,
  ShieldCheck,
  Sun,
  SunMedium,
  TestTube,
  Timer,
  Trash2,
  UserPlus,
  Users,
  Wrench,
  X,
  Zap,
} from 'lucide-react';

export const AppIcon = ({ icon: Icon, size = 16, strokeWidth = 2, className = '', ...props }) => {
  if (!Icon) return null;
  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={className ? `app-icon ${className}` : 'app-icon'}
      aria-hidden={props['aria-label'] ? undefined : true}
      {...props}
    />
  );
};

export const Icons = {
  logo: Layers,
  layoutGrid: LayoutGrid,
  list: List,
  listChecks: ListChecks,
  bell: Bell,
  chevronRight: ChevronRight,
  plus: Plus,
  x: X,
  menu: Menu,
  moon: Moon,
  panelLeftClose: PanelLeftClose,
  panelLeftOpen: PanelLeftOpen,
  sun: Sun,
  search: Search,
  send: Send,
  messageSquare: MessageSquare,
  arrowLeftRight: ArrowLeftRight,
  circle: Circle,
  circleAlert: CircleAlert,
  download: Download,
  externalLink: ExternalLink,
  alertTriangle: AlertTriangle,
  bug: Bug,
  calendarDays: CalendarDays,
  timer: Timer,
  check: Check,
  clipboardCheck: ClipboardCheck,
  arrowRight: ArrowRight,
  play: Play,
  keyRound: KeyRound,
  fileSpreadsheet: FileSpreadsheet,
  fileText: FileText,
  monitor: Monitor,
  pencil: Pencil,
  trash: Trash2,
  users: Users,
  copy: Copy,
  eye: Eye,
  eyeOff: EyeOff,
  checkCircle: CheckCircle2,
  checkCheck: CheckCheck,
  userPlus: UserPlus,
  flag: Flag,
  graduationCap: GraduationCap,
  shieldCheck: ShieldCheck,
  rocket: Rocket,
  code: Code,
  layers: Layers,
};

export const ENV_ICONS = {
  Development: Code,
  Staging: Layers,
  UAT: ShieldCheck,
  Production: Rocket,
};

export function IconButton({ icon, label, variant = 'default', size = 15, className = '', ...props }) {
  const cn = `icon-btn${variant === 'danger' ? ' icon-btn-danger' : ''}${variant === 'success' ? ' icon-btn-success' : ''}${className ? ` ${className}` : ''}`;
  return (
    <button type="button" className={cn} title={label} aria-label={label} {...props}>
      <AppIcon icon={icon} size={size} />
    </button>
  );
}

export const PROJECT_SECTION_ICONS = {
  dashboard: LayoutDashboard,
  members: Users,
  'project-team': Users,
  backlog: List,
  sprint: Zap,
  scrum: Clock,
  scope: FileText,
  bugs: Bug,
  testing: ClipboardCheck,
  deploy: Code,
  credentials: KeyRound,
  maint: Wrench,
  roadmap: GanttChart,
  reports: BarChart3,
};

export const NOTIFICATION_ICONS = {
  pr: GitPullRequest,
  bug: Bug,
  sprint: Zap,
  deploy: Rocket,
  task: CheckCircle2,
  default: Megaphone,
};

export const CEREMONY_ICONS = {
  planning: Calendar,
  standup: SunMedium,
  review: Search,
  retro: RefreshCw,
  grooming: ClipboardList,
  stakeholder: BarChart2,
};

export const SDLC_ICONS = {
  Planning: ClipboardList,
  Design: Palette,
  Development: Monitor,
  Testing: TestTube,
  Deployment: Rocket,
  Maintenance: Wrench,
};
