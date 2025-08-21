

import React from 'react';
import { 
  Home, Users, BarChartBig,
  Sparkles, Cog, PlusCircle, X, Trash2, Edit3,
  Eye, EyeOff,
  Save, Check, ChevronLeft, ChevronRight, Wallet, ExternalLink,
  Plus, XCircle, LogOut, Paperclip, Mic, ArchiveRestore, FolderClosed, UserPlus, Archive, Trash,
  ChevronDown, Download, Briefcase, Calendar, ListTodo, FileText, Bot, ImageUp, ImageOff, List, DollarSign, Link2, Send, FileType2, MessageSquare, Upload
} from 'lucide-react';
import { JobStatus, ServiceType, CaseStatus, CaseType, ContractType, TaskStatus } from './types';

export const APP_NAME = "JurisFinance";
export const ACCENT_COLOR = "custom-brown"; // This will be dynamically overridden by settings

// Lucide Icons Exports
export const HomeIcon = Home;
export const UsersIcon = Users; // Represents "Devedores"
export const ChartBarIcon = BarChartBig; // Represents "Relatórios"
export const SettingsIcon = Cog;
export const EyeOpenIcon = Eye;
export const EyeClosedIcon = EyeOff;
export const PlusCircleIcon = PlusCircle;
export const PencilIcon = Edit3;
export const TrashIcon = Trash2;
export const XIcon = X;
export const SaveIcon = Save;
export const LogOutIcon = LogOut;
export const RestoreIcon = ArchiveRestore;
export const ArchiveFolderIcon = FolderClosed; 
export const ExternalLinkIcon = ExternalLink;
export const SparklesIcon = Sparkles;
export const PlusIcon = Plus;
export const RemoveLinkIcon = XCircle;
export const CheckIcon = Check;
export const ChevronLeftIcon = ChevronLeft;
export const ChevronRightIcon = ChevronRight;
export const WalletIcon = Wallet;
export const ChevronDownIcon = ChevronDown;
export const DownloadIcon = Download;
export const UploadIcon = Upload;
export const PaperclipIcon = Paperclip;
export const MicIcon = Mic;
export const AddUserIcon = UserPlus;
export const ArchiveActionIcon = Archive;
export const TrashActionIcon = Trash;
export const ClientIcon = Users; // Re-using for Debtors

// --- NEWLY ADDED ICONS ---
export const BriefcaseIcon = Briefcase;
export const CalendarIcon = Calendar;
export const TaskIcon = ListTodo;
export const PageTrashIcon = Trash; // Alias for compatibility
export const ListBulletIcon = List;
export const ArchiveIcon = Archive;
export const CurrencyDollarIcon = DollarSign;
export const LinkIcon = Link2;
export const CloudLinkIcon = Link2; // Alias
export const BotIcon = Bot;
export const DraftIcon = FileType2;
export const ImageUpIcon = ImageUp;
export const ImageOffIcon = ImageOff;
export const ContractIcon = FileText;
export const SendHorizonal = Send;


export const NAVIGATION_ITEMS = [
  { name: 'Painel Financeiro', path: '/financeiro', icon: WalletIcon },
  { name: 'Devedores', path: '/devedores', icon: ClientIcon },
  { name: 'Contratos', path: '/contratos', icon: ContractIcon },
  { name: 'Assistente AI', path: '/ai-assistant', icon: SparklesIcon },
];

// --- NEWLY ADDED CONSTANTS ---

export const KANBAN_COLUMNS = [
  { id: 'col-1', title: 'Briefing / Ideias', status: JobStatus.BRIEFING },
  { id: 'col-2', title: 'Em Produção', status: JobStatus.PRODUCTION },
  { id: 'col-3', title: 'Em Revisão', status: JobStatus.REVIEW },
  { id: 'col-4', title: 'Finalizado', status: JobStatus.FINALIZED },
  { id: 'col-5', title: 'Pago / Arquivar', status: JobStatus.PAID },
];

export const SERVICE_TYPE_OPTIONS = Object.values(ServiceType).map(value => ({ value, label: value }));
export const JOB_STATUS_OPTIONS = Object.values(JobStatus).map(value => ({ value, label: value }));
export const CASE_STATUS_OPTIONS = Object.values(CaseStatus).map(value => ({ value, label: value }));
export const CASE_TYPE_OPTIONS = Object.values(CaseType).map(value => ({ value, label: value }));
export const CONTRACT_TYPE_OPTIONS = Object.values(ContractType).map(value => ({ value, label: value }));
export const TASK_STATUS_OPTIONS = Object.values(TaskStatus).map(value => ({ value, label: value }));