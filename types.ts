
export interface Debtor {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  cpf?: string;
  observations?: string;
  createdAt: string;
  isDeleted?: boolean;
  isArchived?: boolean;
}

export type Client = Debtor; // Alias for compatibility with older components

export enum InstallmentStatus {
  PENDENTE = 'Pendente',
  PAGA_PARCIALMENTE = 'Paga Parcialmente',
  PAGA = 'Paga',
  ATRASADA = 'Atrasada',
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method?: string;
  notes?: string;
}

export interface Installment {
  id:string;
  installmentNumber: number;
  dueDate: string;
  value: number;
  paidAmount: number;
  status: InstallmentStatus;
  paymentHistory: Payment[];
}

export interface AgreementUpdate {
  id: string;
  text: string;
  timestamp: string;
  updatedAt?: string;
  history?: { text: string; timestamp: string }[];
  isDeleted?: boolean;
}

export interface DebtorAgreement {
    id: string;
    debtorId: string;
    caseNumberLink?: string; // N do processo
    originalDebt: number;
    agreementValue: number;
    installments: Installment[];
    status: 'Ativo' | 'Quitado' | 'Inadimplente';
    notes?: string;
    feePercentage: number; // Honorários do advogado sobre o valor pago
    isDeleted?: boolean;
    isArchived?: boolean;
    updates?: AgreementUpdate[];
    createdAt: string;
}

export interface AppSettings {
  customLogo?: string; // base64 string
  customFavicon?: string; // base64 string
  userName?: string; 
  privacyModeEnabled?: boolean; 
  googleCalendarConnected?: boolean;
  splashScreenBackgroundColor?: string;
}

export interface AIChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  retrievedContext?: {
    uri?: string;
    title?: string;
  };
}


// --- NEWLY ADDED TYPES ---

export interface User {
  id: string;
  username: string;
}

export enum ServiceType {
  VIDEO = 'Vídeo',
  DESIGN = 'Design Gráfico',
  SOCIAL_MEDIA = 'Social Media',
  WEBSITE = 'Website',
  CONSULTORIA = 'Consultoria',
  OUTRO = 'Outro',
}

export enum JobStatus {
  BRIEFING = 'Briefing',
  PRODUCTION = 'Produção',
  REVIEW = 'Revisão',
  FINALIZED = 'Finalizado',
  PAID = 'Pago (Arquivo)',
}

export interface JobObservation {
  id: string;
  text: string;
  timestamp: string;
}

export interface Job {
  id: string;
  name: string;
  clientId: string;
  serviceType: ServiceType;
  value: number;
  deadline: string;
  status: JobStatus;
  cloudLinks?: string[];
  notes?: string;
  createdAt: string;
  isDeleted: boolean;
  observationsLog?: JobObservation[];
  createCalendarEvent?: boolean;
  isPrePaid: boolean;
  prePaymentDate?: string;
  paidAt?: string;
  paymentDate?: string;
  paymentMethod?: string;
  paymentAttachmentName?: string;
  paymentAttachmentData?: string; // base64
  paymentNotes?: string;
}

export interface DraftNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  imageBase64?: string;
  imageMimeType?: string;
}

export enum CaseStatus {
  ATIVO = 'Ativo',
  SUSPENSO = 'Suspenso',
  ENCERRADO_EXITO = 'Encerrado com Êxito',
  ENCERRADO_SEM_EXITO = 'Encerrado sem Êxito',
  ARQUIVADO = 'Arquivado',
}

export enum CaseType {
  CIVEL = 'Cível',
  TRABALHISTA = 'Trabalhista',
  PENAL = 'Penal',
  TRIBUTARIO = 'Tributário',
  EMPRESARIAL = 'Empresarial',
  CONSUMIDOR = 'Consumidor',
  OUTRO = 'Outro',
}

export enum ContractType {
  PRO_LABORE = 'Pró-Labore',
  AD_EXITUM = 'Ad Exitum',
  RETAINER = 'Retainer (Mensal)',
  HOURLY = 'Por Hora',
  MIXED = 'Misto',
}

export interface Case {
  id: string;
  name: string;
  caseNumber: string;
  clientId: string;
  court?: string;
  caseType: CaseType;
  status: CaseStatus;
  responsibleLawyers: string[];
  createdAt: string;
  isDeleted: boolean;
  isArchived: boolean;
  contractType?: ContractType;
  contractValue?: number;
  successFeePercentage?: number;
}

export enum TaskStatus {
  PENDENTE = 'Pendente',
  FAZENDO = 'Fazendo',
  CONCLUIDA = 'Concluída',
}

export interface TaskUpdate {
  id: string;
  text: string;
  timestamp: string;
  updatedAt?: string;
  attachmentName?: string;
  attachmentMimeType?: string;
  attachmentData?: string; // base64
}

export interface Task {
  id: string;
  title: string;
  type: 'Prazo' | 'Tarefa';
  dueDate: string;
  assignedTo: string;
  description?: string;
  caseId?: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  isDeleted: boolean;
  isArchived: boolean;
  updates: TaskUpdate[];
}

export enum AppointmentType {
  REUNIAO = 'Reunião',
  AUDIENCIA = 'Audiência',
  SUSTENTACAO_ORAL = 'Sustentação Oral',
  PRAZO_INTERNO = 'Prazo Interno',
  OUTRO = 'Outro',
}

export interface Appointment {
  id: string;
  title: string;
  appointmentType: AppointmentType;
  date: string;
  location?: string;
  notes?: string;
  caseId?: string;
  clientId?: string;
  createCalendarEvent?: boolean;
}

export enum ContractStatus {
  DRAFT = 'Rascunho',
  SENT = 'Enviado',
  SIGNED = 'Assinado',
  EXPIRED = 'Expirado',
  CANCELED = 'Cancelado',
}

export interface Contract {
  id: string;
  name: string;
  agreementId: string;
  clientId: string;
  contractType: ContractType;
  status: ContractStatus;
  value?: number;
  successFeePercentage?: number;
  startDate: string;
  description?: string;
  createdAt: string;
  isDeleted: boolean;
  isArchived: boolean;
  attachmentName?: string;
  attachmentMimeType?: string;
  attachmentData?: string; // base64
}