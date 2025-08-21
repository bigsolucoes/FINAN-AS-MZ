import React from 'react';
import { useAppData } from '../hooks/useAppData';
import { Task, TaskStatus, Case, Client } from '../types';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import { BriefcaseIcon } from 'lucide-react';

const KANBAN_TASK_COLUMNS = [
  { id: 'col-task-1', title: 'Pendente', status: TaskStatus.PENDENTE },
  { id: 'col-task-2', title: 'Fazendo', status: TaskStatus.FAZENDO },
  { id: 'col-task-3', title: 'Concluída', status: TaskStatus.CONCLUIDA },
];

const TaskCard: React.FC<{ task: Task; caseData?: Case; onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void; }> = ({ task, caseData, onDragStart }) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const deadlineDate = new Date(task.dueDate); deadlineDate.setHours(0,0,0,0);
    const isOverdue = deadlineDate < today && task.status !== TaskStatus.CONCLUIDA;
  
    return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="p-4 mb-3 rounded-lg shadow-md border-l-4 bg-amber-50 hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing border-amber-300"
    >
      <h4 className="font-semibold text-md text-slate-800 mb-1">{task.title}</h4>
      <p className={`text-xs px-2 py-0.5 inline-block rounded-full mb-2 ${
        isOverdue ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-600'
      }`}>
        Prazo: {formatDate(task.dueDate)} {isOverdue && '(Atrasado)'}
      </p>
      {caseData && (
          <div className="flex items-center text-xs text-slate-600 mt-2">
              <BriefcaseIcon size={14} className="mr-1.5 flex-shrink-0" />
              <span className="truncate" title={caseData.name}>{caseData.name}</span>
          </div>
      )}
      <p className="text-xs text-slate-500 mt-1">Atribuído a: {task.assignedTo}</p>
    </div>
  );
};

const KanbanColumn: React.FC<{ 
  title: string; 
  status: TaskStatus;
  tasks: Task[];
  cases: Case[];
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetStatus: TaskStatus) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
}> = ({ title, status, tasks, cases, onDrop, onDragOver, onDragStart }) => {
  return (
    <div
      className="bg-slate-100 p-4 rounded-lg w-80 flex-shrink-0 flex flex-col"
      onDrop={(e) => onDrop(e, status)}
      onDragOver={onDragOver}
    >
      <h3 className="font-semibold text-lg text-slate-800 mb-4 sticky top-0 bg-slate-100 py-2 z-10">{title} ({tasks.length})</h3>
      <div className="space-y-3 overflow-y-auto flex-grow min-h-[100px]">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            caseData={cases.find(c => c.id === task.caseId)}
            onDragStart={onDragStart}
          />
        ))}
        {tasks.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Arraste tarefas para cá.</p>}
      </div>
    </div>
  );
};

const TaskKanbanBoard: React.FC = () => {
  const { tasks, cases, updateTask } = useAppData();

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const taskToMove = tasks.find(t => t.id === taskId);

    if (taskToMove && taskToMove.status !== targetStatus) {
      updateTask({ ...taskToMove, status: targetStatus });
      toast.success(`Tarefa "${taskToMove.title}" movida para ${targetStatus}!`);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg h-full flex flex-col">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Quadro de Tarefas</h2>
        <div className="flex-grow overflow-x-auto pb-4">
            <div className="flex space-x-4 min-w-max">
            {KANBAN_TASK_COLUMNS.map(column => (
                <KanbanColumn
                key={column.id}
                title={column.title}
                status={column.status}
                tasks={tasks.filter(task => task.status === column.status)}
                cases={cases}
                onDragStart={onDragStart}
                onDrop={onDrop}
                onDragOver={onDragOver}
                />
            ))}
            </div>
        </div>
    </div>
  );
};

export default TaskKanbanBoard;