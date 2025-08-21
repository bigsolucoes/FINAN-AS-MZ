import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { TaskUpdate } from '../types';
import { formatDate } from '../utils/formatters';
import { PencilIcon, SaveIcon, XIcon, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface TaskUpdateMessageProps {
  taskId: string;
  update: TaskUpdate;
}

const TaskUpdateMessage: React.FC<TaskUpdateMessageProps> = ({ taskId, update }) => {
  const { updateTaskUpdate } = useAppData();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(update.text);

  const handleSave = () => {
    if (editText.trim() === '') {
      toast.error("A atualização não pode ficar em branco.");
      return;
    }
    updateTaskUpdate(taskId, { ...update, text: editText });
    setIsEditing(false);
    toast.success("Atualização salva!");
  };

  const handleCancel = () => {
    setEditText(update.text);
    setIsEditing(false);
  };
  
  const handleDownload = () => {
    if(update.attachmentData && update.attachmentName) {
        const link = document.createElement('a');
        link.href = update.attachmentData;
        link.download = update.attachmentName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }

  return (
    <div className="p-3 rounded-lg bg-white shadow-sm w-full">
      <div className="flex justify-between items-start">
        {isEditing ? (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md text-sm"
            rows={3}
          />
        ) : (
          <div className="flex-grow">
            <p className="text-sm text-slate-800 whitespace-pre-wrap">{update.text}</p>
            {update.attachmentName && (
                 <div className="mt-2 flex items-center">
                    <button onClick={handleDownload} className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md">
                        <Download size={16}/>
                        <span>{update.attachmentName}</span>
                    </button>
                 </div>
            )}
          </div>
        )}
        <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="p-1 text-green-600 hover:bg-green-100 rounded-full" title="Salvar"><SaveIcon size={16} /></button>
              <button onClick={handleCancel} className="p-1 text-red-600 hover:bg-red-100 rounded-full" title="Cancelar"><XIcon size={16} /></button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="p-1 text-slate-500 hover:bg-slate-100 rounded-full" title="Editar"><PencilIcon size={16} /></button>
          )}
        </div>
      </div>
      <div className="text-right text-xs text-slate-400 mt-1">
        {formatDate(update.timestamp, { dateStyle: 'short', timeStyle: 'short' })}
        {update.updatedAt && <span> (editado)</span>}
      </div>
    </div>
  );
};

export default TaskUpdateMessage;