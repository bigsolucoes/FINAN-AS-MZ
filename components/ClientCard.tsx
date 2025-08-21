
import React from 'react';
import { Debtor, DebtorAgreement } from '../types';
import { PencilIcon, TrashIcon, WalletIcon, ArchiveIcon, RestoreIcon } from '../constants';

interface DebtorCardProps {
  client: Debtor; // Prop name kept for compatibility, it's a Debtor
  cases: DebtorAgreement[]; // Prop name kept, it's an array of Agreements
  onView: (client: Debtor) => void;
  onEdit: (client: Debtor) => void;
  onSoftDelete: (clientId: string) => void;
  onToggleArchive: (clientId: string) => void;
  onRestore: (clientId: string) => void;
  onPermanentDelete: (clientId: string) => void;
  isArchivedView: boolean;
}

const DebtorCard: React.FC<DebtorCardProps> = ({ client, cases, onView, onEdit, onSoftDelete, onToggleArchive, onRestore, onPermanentDelete, isArchivedView }) => {
    const cardIsClickable = !isArchivedView;

    const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('button')) return;
        if (cardIsClickable) onView(client);
    };

    return (
        <div 
            onClick={handleCardClick}
            className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between ${cardIsClickable ? 'cursor-pointer' : ''}`}
        >
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-slate-800">{client.name}</h3>
                    <div className="flex space-x-2 flex-shrink-0">
                         {client.isDeleted ? (
                            <>
                                <button onClick={() => onRestore(client.id)} className="text-green-500 hover:text-green-700 p-1" title="Restaurar"><RestoreIcon size={18} /></button>
                                <button onClick={() => onPermanentDelete(client.id)} className="text-red-500 hover:text-red-700 p-1" title="Excluir Permanentemente"><TrashIcon size={18} /></button>
                            </>
                         ) : (
                            <>
                                <button onClick={() => onToggleArchive(client.id)} className="text-slate-500 hover:text-blue-600 p-1" title={client.isArchived ? "Desarquivar" : "Arquivar"}><ArchiveIcon size={18} /></button>
                                <button onClick={() => onEdit(client)} className="text-slate-500 hover:text-blue-600 p-1" title="Editar"><PencilIcon size={18} /></button>
                                <button onClick={() => onSoftDelete(client.id)} className="text-slate-500 hover:text-red-500 p-1" title="Mover para Lixeira"><TrashIcon size={18} /></button>
                            </>
                         )}
                    </div>
                </div>
                {client.company && <p className="text-sm text-slate-500">{client.company}</p>}
                <p className="text-sm text-slate-600 mt-2 truncate" title={client.email}>{client.email}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center text-slate-800">
                    <WalletIcon size={20} />
                    <span className="ml-2">Acordos Atribuídos: {cases.length}</span>
                </div>
            </div>
        </div>
    );
};

export default DebtorCard;
