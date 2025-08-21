import React, { useState, useEffect } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { Task, TaskStatus } from '../../types';
import toast from 'react-hot-toast';
import { TASK_STATUS_OPTIONS } from '../../constants';

interface TaskFormProps {
    onSuccess: () => void;
    taskToEdit?: Task;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSuccess, taskToEdit }) => {
    const { addTask, updateTask, cases } = useAppData();
    
    const [title, setTitle] = useState('');
    const [type, setType] = useState<'Prazo' | 'Tarefa'>('Tarefa');
    const [dueDate, setDueDate] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [description, setDescription] = useState('');
    const [caseId, setCaseId] = useState<string | undefined>(undefined);
    const [status, setStatus] = useState<TaskStatus>(TaskStatus.PENDENTE);

    useEffect(() => {
        if (taskToEdit) {
            setTitle(taskToEdit.title);
            setType(taskToEdit.type);
            setDueDate(new Date(taskToEdit.dueDate).toISOString().split('T')[0]);
            setAssignedTo(taskToEdit.assignedTo);
            setDescription(taskToEdit.description || '');
            setCaseId(taskToEdit.caseId);
            setStatus(taskToEdit.status);
        } else {
            setTitle('');
            setType('Tarefa');
            setDueDate('');
            setAssignedTo('');
            setDescription('');
            setCaseId(undefined);
            setStatus(TaskStatus.PENDENTE);
        }
    }, [taskToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !dueDate || !assignedTo) {
            toast.error("Título, Data de Vencimento e Responsável são obrigatórios.");
            return;
        }

        const taskData = {
            title,
            type,
            dueDate: new Date(dueDate).toISOString(),
            assignedTo,
            description: description || undefined,
            caseId: caseId || undefined,
            status,
        };

        if (taskToEdit) {
            updateTask({ ...taskToEdit, ...taskData });
            toast.success("Tarefa atualizada!");
        } else {
            addTask(taskData);
            toast.success("Tarefa adicionada!");
        }
        onSuccess();
    };
    
    const commonInputClass = "w-full p-2 border border-border-color rounded-md focus:ring-2 focus:ring-accent focus:border-accent text-text-primary outline-none transition-shadow bg-card-bg";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Título <span className="text-red-500">*</span></label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={commonInputClass} required/>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Tipo</label>
                    <select value={type} onChange={e => setType(e.target.value as 'Prazo' | 'Tarefa')} className={commonInputClass}>
                        <option value="Tarefa">Tarefa Interna</option>
                        <option value="Prazo">Prazo Processual</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Vincular ao Processo (Opcional)</label>
                    <select value={caseId || ''} onChange={e => setCaseId(e.target.value)} className={commonInputClass}>
                        <option value="">Nenhum</option>
                        {cases.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Data de Vencimento <span className="text-red-500">*</span></label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={commonInputClass} required/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Responsável <span className="text-red-500">*</span></label>
                    <input type="text" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className={commonInputClass} required placeholder="Ex: Dr. Carlos, Estagiário"/>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className={commonInputClass}>
                    {TASK_STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Descrição (Opcional)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={commonInputClass} />
            </div>

            <div className="flex justify-end pt-2">
                <button type="submit" className="bg-accent text-white px-6 py-2 rounded-lg shadow hover:brightness-90 transition-all">
                {taskToEdit ? 'Salvar Alterações' : 'Adicionar Tarefa'}
                </button>
            </div>
        </form>
    )
}

export default TaskForm;