
import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Task, TaskStatus, Case } from '../types';
import { PlusCircleIcon, PencilIcon, TrashIcon, BriefcaseIcon, PaperclipIcon, MicIcon, ArchiveFolderIcon, RestoreIcon } from '../constants';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/formatters';
import Modal from '../components/Modal';
import TaskForm from './forms/TaskForm';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskUpdateMessage from '../components/TaskUpdateMessage';
import { Link, useParams } from 'react-router-dom';

const TasksPage: React.FC = () => {
  const { tasks, cases, softDeleteTask, restoreTask, toggleTaskArchive, permanentlyDeleteTask, addTaskUpdate, updateTask, loading: appLoading } = useAppData();
  const { view } = useParams<{ view: 'lixeira' | 'arquivados' }>();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [newUpdateText, setNewUpdateText] = useState('');

  const activeTasks = useMemo(() => tasks.filter(t => !t.isDeleted && !t.isArchived), [tasks]);
  const trashedTasks = useMemo(() => tasks.filter(t => t.isDeleted), [tasks]);
  const archivedTasks = useMemo(() => tasks.filter(t => !t.isDeleted && t.isArchived), [tasks]);

  const tasksToDisplaySource = view === 'lixeira' ? trashedTasks : view === 'arquivados' ? archivedTasks : activeTasks;

  const filteredTasks = useMemo(() => {
    const sorted = [...tasksToDisplaySource].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    if (view || filter === 'all') return sorted;
    return sorted.filter(t => t.status === filter);
  }, [tasksToDisplaySource, filter, view]);

  const pageTitle = view === 'lixeira' ? 'Lixeira de Tarefas' : view === 'arquivados' ? 'Tarefas Arquivadas' : 'Tarefas e Prazos';

  const handleAddTask = () => {
    setEditingTask(undefined);
    setIsFormModalOpen(true);
  };
  
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormModalOpen(true);
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
  };
  
  const handleSoftDelete = (taskId: string) => {
    if (window.confirm('Tem certeza que deseja mover esta tarefa para a lixeira?')) {
      softDeleteTask(taskId);
      if (selectedTask?.id === taskId) setSelectedTask(null);
      toast.success('Tarefa movida para a lixeira.');
    }
  };

  const handleAddUpdate = async () => {
    if (!selectedTask || !newUpdateText.trim()) return;
    addTaskUpdate(selectedTask.id, { text: newUpdateText });
    setNewUpdateText('');
    toast.success('Atualização adicionada!');
  };

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedTask) {
        const file = e.target.files[0];
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("O arquivo é muito grande (máx 5MB).");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            addTaskUpdate(selectedTask.id, {
                text: `Anexo: ${file.name}`,
                attachmentName: file.name,
                attachmentMimeType: file.type,
                attachmentData: reader.result as string,
            });
            toast.success(`Arquivo "${file.name}" anexado.`);
        };
        reader.readAsDataURL(file);
    }
    e.target.value = ''; // Reset file input
  };

  if (appLoading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }

  return (
    <div className="flex h-full gap-6">
      {/* Task List Panel */}
      <div className="w-1/3 min-w-[320px] max-w-[400px] bg-white shadow-lg rounded-xl p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-800">{pageTitle}</h2>
          {!view && (
            <button onClick={handleAddTask} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Nova Tarefa/Prazo">
                <PlusCircleIcon size={24} />
            </button>
          )}
        </div>
        {!view ? (
            <div className="flex space-x-1 p-1 bg-slate-100 rounded-lg mb-4">
                {([TaskStatus.PENDENTE, TaskStatus.FAZENDO, TaskStatus.CONCLUIDA, 'all'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`w-full px-3 py-1 text-sm font-medium rounded-md transition-colors ${filter === f ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200'}`}>
                        {f === 'all' ? 'Todas' : f}
                    </button>
                ))}
            </div>
        ) : (
            <Link to="/tarefas" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Voltar para Tarefas Ativas</Link>
        )}
        <div className="flex items-center space-x-3 mb-2 justify-end">
            <Link to="/tarefas/lixeira" className={`flex items-center space-x-1.5 text-sm p-2 rounded-lg ${view === 'lixeira' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}><TrashIcon size={16}/><span>Lixeira</span></Link>
            <Link to="/tarefas/arquivados" className={`flex items-center space-x-1.5 text-sm p-2 rounded-lg ${view === 'arquivados' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}><ArchiveFolderIcon size={16}/><span>Arquivados</span></Link>
        </div>
        <div className="overflow-y-auto flex-grow space-y-2 pr-1">
          {filteredTasks.map(task => {
              const deadline = new Date(task.dueDate);
              const today = new Date(); today.setHours(0,0,0,0);
              const isOverdue = deadline < today && task.status !== TaskStatus.CONCLUIDA;
              return (
                <div key={task.id} onClick={() => handleSelectTask(task)}
                    className={`p-3 rounded-lg cursor-pointer border-l-4 transition-all ${selectedTask?.id === task.id ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 hover:bg-slate-200'} ${isOverdue ? 'border-red-500' : (task.type === 'Prazo' ? 'border-yellow-500' : 'border-teal-500')}`}>
                    <h3 className="font-medium truncate">{task.title}</h3>
                    <p className={`text-xs truncate ${selectedTask?.id === task.id ? 'text-blue-100' : 'text-slate-500'}`}>
                        Vencimento: {formatDate(task.dueDate)} {isOverdue ? <span className="font-bold">(Atrasado)</span> : ''}
                    </p>
                </div>
              )
          })}
           {filteredTasks.length === 0 && <p className="text-center text-slate-500 p-4">Nenhuma tarefa nesta categoria.</p>}
        </div>
      </div>

      {/* Task Details and Updates Panel */}
      <div className="flex-grow bg-white shadow-lg rounded-xl p-6 flex flex-col">
        {selectedTask ? (
            <>
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                <div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedTask.type === 'Prazo' ? 'bg-yellow-100 text-yellow-800' : 'bg-teal-100 text-teal-800'}`}>{selectedTask.type}</span>
                    <h1 className="text-2xl font-bold text-slate-800 mt-2">{selectedTask.title}</h1>
                    <p className="text-sm text-slate-500 mt-1">Responsável: {selectedTask.assignedTo} | Vencimento: {formatDate(selectedTask.dueDate)}</p>
                    {selectedTask.caseId && cases.find(c=>c.id === selectedTask.caseId) &&
                      <p className="text-sm text-slate-500 mt-1 flex items-center"><BriefcaseIcon size={14} className="mr-1.5"/>{cases.find(c=>c.id === selectedTask.caseId)?.name}</p>
                    }
                </div>
                <div className="flex items-center space-x-2">
                    {selectedTask.isDeleted ? (
                        <>
                           <button onClick={() => restoreTask(selectedTask.id)} className="p-2 text-green-500 hover:text-green-700 rounded-full hover:bg-green-100" title="Restaurar Tarefa"><RestoreIcon size={20}/></button>
                           <button onClick={() => permanentlyDeleteTask(selectedTask.id)} className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100" title="Excluir Permanentemente"><TrashIcon size={20}/></button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => handleEditTask(selectedTask)} className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-slate-100" title="Editar Tarefa"><PencilIcon size={20}/></button>
                            <button onClick={() => handleSoftDelete(selectedTask.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100" title="Mover para lixeira"><TrashIcon size={20}/></button>
                        </>
                    )}
                </div>
            </div>
            
            <div className="flex-grow my-4 space-y-4 overflow-y-auto p-2 bg-slate-50 rounded-lg">
                {selectedTask.updates.length === 0 && <p className="text-center text-slate-400 p-4">Nenhuma atualização para esta tarefa ainda.</p>}
                {selectedTask.updates
                    .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                    .map(update => (
                        <TaskUpdateMessage key={update.id} taskId={selectedTask.id} update={update}/>
                ))}
            </div>

            <div className="mt-auto pt-4 border-t border-slate-200">
                <div className="flex items-start space-x-3">
                    <textarea value={newUpdateText} onChange={e => setNewUpdateText(e.target.value)} placeholder="Adicionar uma atualização..." rows={2}
                        className="flex-grow p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                    <div className="flex flex-col space-y-2">
                         <button onClick={handleAddUpdate} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors">Enviar</button>
                         <div className="flex justify-around">
                            <label htmlFor="file-upload" className="cursor-pointer text-slate-500 hover:text-blue-600 p-1" title="Anexar arquivo">
                                <PaperclipIcon size={20}/>
                                <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                            </label>
                            <button className="text-slate-500 hover:text-blue-600 p-1" title="Gravar áudio (em breve)">
                                <MicIcon size={20} className="text-slate-400"/>
                            </button>
                         </div>
                    </div>
                </div>
            </div>
            </>
        ) : (
             <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                <PencilIcon size={64} className="text-slate-300 mb-4" />
                <p className="text-xl">Selecione uma tarefa para ver os detalhes.</p>
                <p className="mt-2">Ou crie uma nova tarefa para começar a organizar seu trabalho.</p>
             </div>
        )}
      </div>

       <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={editingTask ? "Editar Tarefa/Prazo" : "Nova Tarefa/Prazo"}>
          <TaskForm 
            onSuccess={() => {setIsFormModalOpen(false); setEditingTask(undefined);}}
            taskToEdit={editingTask}
          />
      </Modal>
    </div>
  );
};

export default TasksPage;
