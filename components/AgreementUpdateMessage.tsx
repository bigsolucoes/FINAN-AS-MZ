
import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { AgreementUpdate } from '../types';
import { formatDate } from '../utils/formatters';
import { PencilIcon, SaveIcon, XIcon, TrashActionIcon, RestoreIcon } from '../constants';
import toast from 'react-hot-toast';

interface AgreementUpdateMessageProps {
  agreementId: string;
  update: AgreementUpdate;
  onSoftDelete: (agreementId: string, updateId: string) => void;
  onRestore: (agreementId: string, updateId: string) => void;
}

const AgreementUpdateMessage: React.FC<AgreementUpdateMessageProps> = ({ agreementId, update, onSoftDelete, onRestore }) => {
  const { updateAgreementUpdate } = useAppData();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(update.text);
  const [showHistory, setShowHistory] = useState(false);

  const handleSave = () => {
    if (editText.trim() === '') {
      toast.error("A atualização não pode ficar em branco.");
      return;
    }
    if (editText.trim() === update.text) {
        setIsEditing(false);
        return;
    }
    updateAgreementUpdate(agreementId, { ...update, text: editText });
    setIsEditing(false);
    toast.success("Atualização salva!");
  };

  const handleCancel = () => {
    setEditText(update.text);
    setIsEditing(false);
  };
  
  const handleDelete = () => {
      if (window.confirm('Mover esta atualização para a lixeira?')) {
          onSoftDelete(agreementId, update.id);
          toast.success('Atualização movida para lixeira.');
      }
  }

  if (update.isDeleted) {
    return (
      <div className="p-3 rounded-lg bg-slate-100 text-slate-500 w-full opacity-70">
        <p className="text-sm italic line-through">Atualização excluída.</p>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs">{formatDate(update.timestamp, { dateStyle: 'short', timeStyle: 'short' })}</span>
          <button onClick={() => onRestore(agreementId, update.id)} className="p-1 text-green-600 hover:bg-green-100 rounded-full" title="Restaurar">
            <RestoreIcon size={16} />
          </button>
        </div>
      </div>
    );
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
          <p className="text-sm text-slate-800 whitespace-pre-wrap flex-grow">{update.text}</p>
        )}
        <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="p-1 text-green-600 hover:bg-green-100 rounded-full" title="Salvar"><SaveIcon size={16} /></button>
              <button onClick={handleCancel} className="p-1 text-red-600 hover:bg-red-100 rounded-full" title="Cancelar"><XIcon size={16} /></button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="p-1 text-slate-500 hover:bg-slate-100 rounded-full" title="Editar"><PencilIcon size={16} /></button>
              <button onClick={handleDelete} className="p-1 text-red-500 hover:bg-red-100 rounded-full" title="Excluir"><TrashActionIcon size={16} /></button>
            </>
          )}
        </div>
      </div>
      <div className="text-right text-xs text-slate-400 mt-1">
        {formatDate(update.timestamp, { dateStyle: 'short', timeStyle: 'short' })}
        {update.updatedAt && (
            <button onClick={() => setShowHistory(!showHistory)} className="text-blue-600 hover:underline ml-1 focus:outline-none">
                (editado)
            </button>
        )}
      </div>

      {showHistory && update.history && update.history.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-200 space-y-2 animate-modalShow">
          <p className="text-xs font-semibold text-slate-500">Histórico de Edições:</p>
          {[...update.history].reverse().map((h, i) => (
            <div key={i} className="p-2 bg-slate-50 rounded text-xs text-slate-600">
              <p className="whitespace-pre-wrap">{h.text}</p>
              <p className="text-right text-slate-400 mt-1">{formatDate(h.timestamp, { dateStyle: 'short', timeStyle: 'short' })}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgreementUpdateMessage;