
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { Debtor, AppSettings, DebtorAgreement, AIChatMessage, Installment, InstallmentStatus, Payment, AgreementUpdate, Job, Case, Task, Appointment, Contract, DraftNote, Client, TaskUpdate } from '../types';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface AppDataContextType {
  // Debtors & Agreements
  debtors: Debtor[];
  debtorAgreements: DebtorAgreement[];
  addDebtor: (debtor: Omit<Debtor, 'id' | 'createdAt' | 'isDeleted' | 'isArchived'>) => void;
  updateDebtor: (debtor: Debtor) => void;
  toggleDebtorArchive: (debtorId: string) => void;
  softDeleteDebtor: (debtorId: string) => void;
  restoreDebtor: (debtorId: string) => void;
  permanentlyDeleteDebtor: (debtorId: string) => void;
  getDebtorById: (debtorId: string) => Debtor | undefined;
  addDebtorAgreement: (agreementData: Omit<DebtorAgreement, 'id' | 'isDeleted' | 'isArchived' | 'updates' | 'createdAt'>) => void;
  updateDebtorAgreement: (agreement: DebtorAgreement) => void;
  toggleDebtorAgreementArchive: (agreementId: string) => void;
  softDeleteDebtorAgreement: (agreementId: string) => void;
  restoreDebtorAgreement: (agreementId: string) => void;
  permanentlyDeleteDebtorAgreement: (agreementId: string) => void;
  addAgreementUpdate: (agreementId: string, updateData: Omit<AgreementUpdate, 'id' | 'timestamp'>) => void;
  updateAgreementUpdate: (agreementId: string, updateData: AgreementUpdate) => void;
  softDeleteAgreementUpdate: (agreementId: string, updateId: string) => void;
  restoreAgreementUpdate: (agreementId: string, updateId: string) => void;
  registerInstallmentPayment: (agreementId: string, installmentId: string, paymentAmount: number) => void;

  // General App State
  settings: AppSettings;
  aiChatHistory: AIChatMessage[];
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  addAiChatMessage: (message: AIChatMessage) => void;
  
  // Auth & Loading
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
  loading: boolean;
  isResting: boolean;
  enterRestMode: () => void;
  exitRestMode: () => void;

  // --- NEWLY ADDED CONTEXT PROPERTIES ---
  clients: Client[]; // Alias for debtors
  
  jobs: Job[];
  addJob: (job: Omit<Job, 'id'|'createdAt'|'isDeleted'|'isPrePaid'|'paidAt'|'observationsLog'>) => void;
  updateJob: (job: Job) => void;
  deleteJob: (jobId: string) => void; // soft delete
  permanentlyDeleteJob: (jobId: string) => void;

  cases: Case[];
  addCase: (caseData: Omit<Case, 'id' | 'createdAt' | 'isDeleted' | 'isArchived'>) => void;
  updateCase: (caseData: Case) => void;
  softDeleteCase: (caseId: string) => void;
  restoreCase: (caseId: string) => void;
  toggleCaseArchive: (caseId: string) => void;
  permanentlyDeleteCase: (caseId: string) => void;
  
  tasks: Task[];
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'isDeleted' | 'isArchived' | 'updates'>) => void;
  updateTask: (task: Task) => void;
  softDeleteTask: (taskId: string) => void;
  restoreTask: (taskId: string) => void;
  toggleTaskArchive: (taskId: string) => void;
  permanentlyDeleteTask: (taskId: string) => void;
  addTaskUpdate: (taskId: string, updateData: Omit<TaskUpdate, 'id'|'timestamp'>) => void;
  updateTaskUpdate: (taskId: string, updateData: TaskUpdate) => void;

  appointments: Appointment[];
  addAppointment: (appointmentData: Omit<Appointment, 'id'>) => void;
  updateAppointment: (appointment: Appointment) => void;
  
  contracts: Contract[];
  addContract: (contractData: Omit<Contract, 'id' | 'createdAt' | 'isDeleted' | 'isArchived'>) => void;
  updateContract: (contract: Contract) => void;
  softDeleteContract: (contractId: string) => void;
  restoreContract: (contractId: string) => void;
  toggleContractArchive: (contractId: string) => void;
  permanentlyDeleteContract: (contractId: string) => void;

  draftNotes: DraftNote[];
  addDraftNote: (draftData: Omit<DraftNote, 'id'|'createdAt'|'updatedAt'>) => DraftNote;
  updateDraftNote: (draft: DraftNote) => void;
  deleteDraftNote: (draftId: string) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const initialDebtors: Debtor[] = [
    { id: 'debtor-1', name: 'Infratech Ltda', company: 'Tecnologia', email: 'financeiro@infratech.com', phone: '11999998888', createdAt: new Date().toISOString(), cpf: '11.222.333/0001-44', observations: 'Contato principal: Sr. Antunes' },
    { id: 'debtor-2', name: 'Carlos Ferreira', email: 'carlos.ferreira@email.com', createdAt: new Date().toISOString(), cpf: '111.222.333-44', observations: 'Negociação difícil.' },
];

const initialDebtorAgreements: DebtorAgreement[] = [
    {
        id: 'agreement1',
        debtorId: 'debtor-1',
        caseNumberLink: '0012345-67.2023.8.26.0100',
        originalDebt: 100000,
        agreementValue: 80000,
        status: 'Ativo',
        feePercentage: 20, // 20% de honorários sobre o recebido
        createdAt: new Date().toISOString(),
        installments: Array.from({ length: 8 }, (_, i) => ({
            id: uuidv4(),
            installmentNumber: i + 1,
            dueDate: new Date(2024, 6 + i, 15).toISOString(),
            value: 10000,
            paidAmount: i < 2 ? 10000 : 0, // Primeiras 2 pagas
            status: i < 2 ? InstallmentStatus.PAGA : InstallmentStatus.PENDENTE,
            paymentHistory: i < 2 ? [{ id: uuidv4(), date: new Date(2024, 6+i, 14).toISOString(), amount: 10000, method: 'PIX'}] : [],
        })),
        updates: [],
    }
];

const initialAiChatHistory: AIChatMessage[] = [];

const initialSettings: AppSettings = {
  customLogo: undefined,
  customFavicon: undefined,
  userName: 'Advogado(a)',
  privacyModeEnabled: false,
  googleCalendarConnected: false,
  splashScreenBackgroundColor: undefined,
};

// Internal helper to calculate agreement status based on its installments
const _getUpdatedAgreementState = (agreement: DebtorAgreement): DebtorAgreement => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let hasOverdue = false;
    const updatedInstallments = agreement.installments.map(inst => {
        const dueDate = new Date(inst.dueDate);
        dueDate.setUTCHours(0,0,0,0);
        
        if (inst.status !== InstallmentStatus.PAGA && dueDate < today) {
            hasOverdue = true;
            return { ...inst, status: InstallmentStatus.ATRASADA };
        }
        if (inst.status === InstallmentStatus.ATRASADA && dueDate >= today) {
            // If a previously overdue payment is now not overdue (e.g. date changed)
            return { ...inst, status: inst.paidAmount > 0 ? InstallmentStatus.PAGA_PARCIALMENTE : InstallmentStatus.PENDENTE };
        }
        return inst;
    });
    
    const allPaid = updatedInstallments.every(inst => inst.status === InstallmentStatus.PAGA);

    let newStatus: 'Ativo' | 'Quitado' | 'Inadimplente' = 'Ativo';
    if (allPaid) {
        newStatus = 'Quitado';
    } else if (hasOverdue) {
        newStatus = 'Inadimplente';
    }

    return { ...agreement, installments: updatedInstallments, status: newStatus };
};


export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Existing state
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [debtorAgreements, setDebtorAgreements] = useState<DebtorAgreement[]>([]);
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [aiChatHistory, setAiChatHistory] = useState<AIChatMessage[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  // New state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [draftNotes, setDraftNotes] = useState<DraftNote[]>([]);

  useEffect(() => {
    if (settings.customFavicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.customFavicon;
    }
  }, [settings.customFavicon]);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const storedData = {
          debtors: localStorage.getItem('jurisfinance_debtors'),
          agreements: localStorage.getItem('jurisfinance_debtorAgreements'),
          settings: localStorage.getItem('jurisfinance_settings'),
          aiChat: localStorage.getItem('jurisfinance_aiChatHistory'),
          auth: localStorage.getItem('jurisfinance_isAuthenticated'),
          jobs: localStorage.getItem('jurisfinance_jobs'),
          cases: localStorage.getItem('jurisfinance_cases'),
          tasks: localStorage.getItem('jurisfinance_tasks'),
          appointments: localStorage.getItem('jurisfinance_appointments'),
          contracts: localStorage.getItem('jurisfinance_contracts'),
          draftNotes: localStorage.getItem('jurisfinance_draftNotes'),
      };
      setDebtors(storedData.debtors ? JSON.parse(storedData.debtors) : initialDebtors);
      
      let loadedAgreements = storedData.agreements ? JSON.parse(storedData.agreements) : initialDebtorAgreements;
      loadedAgreements = loadedAgreements.map(_getUpdatedAgreementState);
      setDebtorAgreements(loadedAgreements);
      
      setSettings(storedData.settings ? JSON.parse(storedData.settings) : initialSettings);
      setAiChatHistory(storedData.aiChat ? JSON.parse(storedData.aiChat) : initialAiChatHistory);
      setIsAuthenticated(storedData.auth ? JSON.parse(storedData.auth) : false);

      // Load new data
      setJobs(storedData.jobs ? JSON.parse(storedData.jobs) : []);
      setCases(storedData.cases ? JSON.parse(storedData.cases) : []);
      setTasks(storedData.tasks ? JSON.parse(storedData.tasks) : []);
      setAppointments(storedData.appointments ? JSON.parse(storedData.appointments) : []);
      setContracts(storedData.contracts ? JSON.parse(storedData.contracts) : []);
      setDraftNotes(storedData.draftNotes ? JSON.parse(storedData.draftNotes) : []);

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      // Reset all data on failure
      setDebtors(initialDebtors);
      setDebtorAgreements(initialDebtorAgreements);
      setSettings(initialSettings);
      setAiChatHistory(initialAiChatHistory);
      setIsAuthenticated(false);
      setJobs([]); setCases([]); setTasks([]); setAppointments([]); setContracts([]); setDraftNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => { if (!loading) localStorage.setItem('jurisfinance_debtors', JSON.stringify(debtors)); }, [debtors, loading]);
  useEffect(() => { if (!loading) localStorage.setItem('jurisfinance_debtorAgreements', JSON.stringify(debtorAgreements)); }, [debtorAgreements, loading]);
  useEffect(() => { if (!loading) localStorage.setItem('jurisfinance_settings', JSON.stringify(settings)); }, [settings, loading]);
  useEffect(() => { if (!loading) localStorage.setItem('jurisfinance_aiChatHistory', JSON.stringify(aiChatHistory)); }, [aiChatHistory, loading]);
  useEffect(() => { if (!loading) localStorage.setItem('jurisfinance_isAuthenticated', JSON.stringify(isAuthenticated)); }, [isAuthenticated, loading]);
  // Save new data
  useEffect(() => { if (!loading) localStorage.setItem('jurisfinance_jobs', JSON.stringify(jobs)); }, [jobs, loading]);
  useEffect(() => { if (!loading) localStorage.setItem('jurisfinance_cases', JSON.stringify(cases)); }, [cases, loading]);
  useEffect(() => { if (!loading) localStorage.setItem('jurisfinance_tasks', JSON.stringify(tasks)); }, [tasks, loading]);
  useEffect(() => { if (!loading) localStorage.setItem('jurisfinance_appointments', JSON.stringify(appointments)); }, [appointments, loading]);
  useEffect(() => { if (!loading) localStorage.setItem('jurisfinance_contracts', JSON.stringify(contracts)); }, [contracts, loading]);
  useEffect(() => { if (!loading) localStorage.setItem('jurisfinance_draftNotes', JSON.stringify(draftNotes)); }, [draftNotes, loading]);

  // Existing Methods
  const addDebtor = useCallback((data: Omit<Debtor, 'id' | 'createdAt'|'isDeleted'|'isArchived'>) => setDebtors(p => [...p, { ...data, id: uuidv4(), createdAt: new Date().toISOString(), isDeleted: false, isArchived: false }]), []);
  const updateDebtor = useCallback((data: Debtor) => setDebtors(p => p.map(c => c.id === data.id ? data : c)), []);
  const toggleDebtorArchive = useCallback((id: string) => setDebtors(p => p.map(c => c.id === id ? { ...c, isArchived: !c.isArchived } : c)), []);
  const softDeleteDebtor = useCallback((id: string) => setDebtors(p => p.map(c => c.id === id ? { ...c, isDeleted: true } : c)), []);
  const restoreDebtor = useCallback((id: string) => setDebtors(p => p.map(c => c.id === id ? { ...c, isDeleted: false } : c)), []);
  const permanentlyDeleteDebtor = useCallback((id: string) => setDebtors(p => p.filter(c => c.id !== id)), []);
  const getDebtorById = useCallback((id: string) => debtors.find(c => c.id === id), [debtors]);

  const addDebtorAgreement = useCallback((data: Omit<DebtorAgreement, 'id' | 'isDeleted' | 'isArchived' | 'updates' | 'createdAt'>) => setDebtorAgreements(p => [...p, { ...data, id: uuidv4(), createdAt: new Date().toISOString(), updates: [], isDeleted: false, isArchived: false }]), []);
  const updateDebtorAgreement = useCallback((data: DebtorAgreement) => setDebtorAgreements(p => p.map(a => a.id === data.id ? _getUpdatedAgreementState(data) : a)), []);
  const toggleDebtorAgreementArchive = useCallback((id: string) => setDebtorAgreements(p => p.map(a => a.id === id ? { ...a, isArchived: !a.isArchived } : a)), []);
  const softDeleteDebtorAgreement = useCallback((id: string) => setDebtorAgreements(p => p.map(a => a.id === id ? { ...a, isDeleted: true } : a)), []);
  const restoreDebtorAgreement = useCallback((id: string) => setDebtorAgreements(p => p.map(a => a.id === id ? { ...a, isDeleted: false } : a)), []);
  const permanentlyDeleteDebtorAgreement = useCallback((id: string) => setDebtorAgreements(p => p.filter(a => a.id !== id)), []);
  
  const addAgreementUpdate = useCallback((agreementId: string, updateData: Omit<AgreementUpdate, 'id' | 'timestamp'>) => {
    setDebtorAgreements(p => p.map(a => 
      a.id === agreementId 
        ? { ...a, updates: [...(a.updates || []), { ...updateData, id: uuidv4(), timestamp: new Date().toISOString(), history: [], isDeleted: false }] } 
        : a
    ));
  }, []);
  
  const updateAgreementUpdate = useCallback((agreementId: string, updatedUpdate: AgreementUpdate) => {
    setDebtorAgreements(p => p.map(a => {
        if (a.id !== agreementId) return a;
        
        const oldUpdate = (a.updates || []).find(u => u.id === updatedUpdate.id);
        if (!oldUpdate) return a;

        const historyEntry = {
            text: oldUpdate.text,
            timestamp: oldUpdate.updatedAt || oldUpdate.timestamp,
        };

        const newHistory = [...(oldUpdate.history || []), historyEntry];

        return {
            ...a,
            updates: (a.updates || []).map(u => 
                u.id === updatedUpdate.id 
                ? { 
                    ...updatedUpdate, 
                    updatedAt: new Date().toISOString(),
                    history: newHistory,
                  } 
                : u
            )
        };
    }));
  }, []);

  const softDeleteAgreementUpdate = useCallback((agreementId: string, updateId: string) => {
    setDebtorAgreements(p => p.map(a => a.id === agreementId ? {
        ...a,
        updates: (a.updates || []).map(u => u.id === updateId ? { ...u, isDeleted: true } : u)
    } : a));
  }, []);

  const restoreAgreementUpdate = useCallback((agreementId: string, updateId: string) => {
      setDebtorAgreements(p => p.map(a => a.id === agreementId ? {
          ...a,
          updates: (a.updates || []).map(u => u.id === updateId ? { ...u, isDeleted: false } : u)
      } : a));
  }, []);


  const registerInstallmentPayment = useCallback((agreementId: string, installmentId: string, paymentAmount: number) => {
    setDebtorAgreements(prevAgreements => {
        const newAgreements = prevAgreements.map(agreement => {
            if (agreement.id !== agreementId) return agreement;

            let installmentUpdated = false;
            const newInstallments = agreement.installments.map(inst => {
                if (inst.id !== installmentId) return inst;

                installmentUpdated = true;
                const newPaidAmount = inst.paidAmount + paymentAmount;
                const remaining = inst.value - newPaidAmount;

                let newStatus = inst.status;
                if (remaining <= 0.001) { // Use a small tolerance for float comparison
                    newStatus = InstallmentStatus.PAGA;
                } else {
                    newStatus = InstallmentStatus.PAGA_PARCIALMENTE;
                }

                const newPayment: Payment = {
                    id: uuidv4(),
                    date: new Date().toISOString(),
                    amount: paymentAmount,
                    notes: `Pagamento de ${paymentAmount.toFixed(2)} registrado.`
                };
                
                return {
                    ...inst,
                    paidAmount: newPaidAmount,
                    status: newStatus,
                    paymentHistory: [...inst.paymentHistory, newPayment]
                };
            });
            
            if (!installmentUpdated) return agreement;

            const updatedAgreement = { ...agreement, installments: newInstallments };
            return _getUpdatedAgreementState(updatedAgreement);
        });
        return newAgreements;
    });
  }, []);

  const addAiChatMessage = useCallback((message: AIChatMessage) => setAiChatHistory(prev => [...prev, message]), []);
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => setSettings(prev => ({ ...prev, ...newSettings })), []);
  
  const logout = useCallback(() => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    setIsAuthenticated(false);
    setIsResting(false);
    toast("Você foi desconectado.");
  }, []);

  const login = useCallback((pin: string): boolean => {
    // Simplified PIN auth. In real app, use hashed passwords.
    if (pin === '0000' || pin === 'admin') {
        setIsAuthenticated(true);
        setIsResting(false);
        toast.success("Acesso Liberado!");
        return true;
    }
    return false;
  }, []);

  const enterRestMode = useCallback(() => {
    setIsResting(true);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    logoutTimerRef.current = setTimeout(() => {
        logout();
        toast.error("Sessão encerrada por inatividade.");
    }, 5 * 60 * 1000);
  }, [logout]);

  const exitRestMode = useCallback(() => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    setIsResting(false);
  }, []);

  // --- NEWLY ADDED METHODS ---
  // Jobs
  const addJob = useCallback((data) => setJobs(p => [...p, { ...data, id: uuidv4(), createdAt: new Date().toISOString(), isDeleted: false, isPrePaid: false, observationsLog: [] }]), []);
  const updateJob = useCallback((data) => setJobs(p => p.map(j => j.id === data.id ? data : j)), []);
  const deleteJob = useCallback((id: string) => setJobs(p => p.map(j => j.id === id ? { ...j, isDeleted: true } : j)), []);
  const permanentlyDeleteJob = useCallback((id: string) => setJobs(p => p.filter(j => j.id !== id)), []);

  // Cases
  const addCase = useCallback((data) => setCases(p => [...p, { ...data, id: uuidv4(), createdAt: new Date().toISOString(), isDeleted: false, isArchived: false }]), []);
  const updateCase = useCallback((data) => setCases(p => p.map(c => c.id === data.id ? data : c)), []);
  const softDeleteCase = useCallback((id: string) => setCases(p => p.map(c => c.id === id ? { ...c, isDeleted: true } : c)), []);
  const restoreCase = useCallback((id: string) => setCases(p => p.map(c => c.id === id ? { ...c, isDeleted: false } : c)), []);
  const toggleCaseArchive = useCallback((id: string) => setCases(p => p.map(c => c.id === id ? { ...c, isArchived: !c.isArchived } : c)), []);
  const permanentlyDeleteCase = useCallback((id: string) => setCases(p => p.filter(c => c.id !== id)), []);

  // Tasks
  const addTask = useCallback((data) => setTasks(p => [...p, { ...data, id: uuidv4(), createdAt: new Date().toISOString(), isDeleted: false, isArchived: false, updates: [] }]), []);
  const updateTask = useCallback((data) => setTasks(p => p.map(t => t.id === data.id ? data : t)), []);
  const softDeleteTask = useCallback((id: string) => setTasks(p => p.map(t => t.id === id ? { ...t, isDeleted: true } : t)), []);
  const restoreTask = useCallback((id: string) => setTasks(p => p.map(t => t.id === id ? { ...t, isDeleted: false } : t)), []);
  const toggleTaskArchive = useCallback((id: string) => setTasks(p => p.map(t => t.id === id ? { ...t, isArchived: !t.isArchived } : t)), []);
  const permanentlyDeleteTask = useCallback((id: string) => setTasks(p => p.filter(t => t.id !== id)), []);
  const addTaskUpdate = useCallback((taskId: string, updateData) => setTasks(p => p.map(t => t.id === taskId ? { ...t, updates: [...t.updates, { ...updateData, id: uuidv4(), timestamp: new Date().toISOString() }] } : t)), []);
  const updateTaskUpdate = useCallback((taskId: string, updatedUpdate: TaskUpdate) => setTasks(p => p.map(t => t.id === taskId ? { ...t, updates: t.updates.map(u => u.id === updatedUpdate.id ? { ...updatedUpdate, updatedAt: new Date().toISOString() } : u) } : t)), []);

  // Appointments
  const addAppointment = useCallback((data) => setAppointments(p => [...p, { ...data, id: uuidv4() }]), []);
  const updateAppointment = useCallback((data) => setAppointments(p => p.map(a => a.id === data.id ? data : a)), []);

  // Contracts
  const addContract = useCallback((data) => setContracts(p => [...p, { ...data, id: uuidv4(), createdAt: new Date().toISOString(), isDeleted: false, isArchived: false }]), []);
  const updateContract = useCallback((data) => setContracts(p => p.map(c => c.id === data.id ? data : c)), []);
  const softDeleteContract = useCallback((id: string) => setContracts(p => p.map(c => c.id === id ? { ...c, isDeleted: true } : c)), []);
  const restoreContract = useCallback((id: string) => setContracts(p => p.map(c => c.id === id ? { ...c, isDeleted: false } : c)), []);
  const toggleContractArchive = useCallback((id: string) => setContracts(p => p.map(c => c.id === id ? { ...c, isArchived: !c.isArchived } : c)), []);
  const permanentlyDeleteContract = useCallback((id: string) => setContracts(p => p.filter(c => c.id !== id)), []);

  // DraftNotes
  const addDraftNote = useCallback((data) => {
    const now = new Date().toISOString();
    const newDraft = { ...data, id: uuidv4(), createdAt: now, updatedAt: now };
    setDraftNotes(p => [...p, newDraft]);
    return newDraft;
  }, []);
  const updateDraftNote = useCallback((data) => setDraftNotes(p => p.map(d => d.id === data.id ? { ...data, updatedAt: new Date().toISOString() } : d)), []);
  const deleteDraftNote = useCallback((id: string) => setDraftNotes(p => p.filter(d => d.id !== id)), []);


  const value: AppDataContextType = { 
    // Existing
    debtors, debtorAgreements, settings, aiChatHistory,
    addDebtor, updateDebtor, toggleDebtorArchive, softDeleteDebtor, restoreDebtor, permanentlyDeleteDebtor, getDebtorById,
    addDebtorAgreement, updateDebtorAgreement, toggleDebtorAgreementArchive, softDeleteDebtorAgreement, restoreDebtorAgreement, permanentlyDeleteDebtorAgreement,
    addAgreementUpdate, updateAgreementUpdate, softDeleteAgreementUpdate, restoreAgreementUpdate,
    registerInstallmentPayment,
    addAiChatMessage, updateSettings,
    isAuthenticated, login, logout, loading, isResting, enterRestMode, exitRestMode,

    // New
    clients: debtors,
    jobs, addJob, updateJob, deleteJob, permanentlyDeleteJob,
    cases, addCase, updateCase, softDeleteCase, restoreCase, toggleCaseArchive, permanentlyDeleteCase,
    tasks, addTask, updateTask, softDeleteTask, restoreTask, toggleTaskArchive, permanentlyDeleteTask, addTaskUpdate, updateTaskUpdate,
    appointments, addAppointment, updateAppointment,
    contracts, addContract, updateContract, softDeleteContract, restoreContract, toggleContractArchive, permanentlyDeleteContract,
    draftNotes, addDraftNote, updateDraftNote, deleteDraftNote,
  };
  
  return React.createElement(AppDataContext.Provider, { value }, children);
};

export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (context === undefined) throw new Error('useAppData must be used within an AppDataProvider');
  return context;
};