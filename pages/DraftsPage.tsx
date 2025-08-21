
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useAppData } from '../hooks/useAppData';
import { DraftNote } from '../types';
import { PlusCircleIcon, BotIcon, TrashIcon, PencilIcon, SaveIcon, XIcon, DraftIcon, ImageUpIcon, ImageOffIcon } from '../constants';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/formatters';
import Modal from '../components/Modal'; // Assuming Modal component exists
import LoadingSpinner from '../components/LoadingSpinner';
// import { callGeminiApi } from '../services/geminiService'; // Uncomment when AI integration is ready

const DraftsPage: React.FC = () => {
  const { draftNotes, addDraftNote, updateDraftNote, deleteDraftNote, loading: appLoading } = useAppData();
  const [selectedDraft, setSelectedDraft] = useState<DraftNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImageBase64, setEditImageBase64] = useState<string | undefined>(undefined);
  const [editImageMimeType, setEditImageMimeType] = useState<string | undefined>(undefined);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (selectedDraft && isEditing) {
      setEditTitle(selectedDraft.title);
      setEditContent(selectedDraft.content);
      setEditImageBase64(selectedDraft.imageBase64);
      setEditImageMimeType(selectedDraft.imageMimeType);
    } else if (!selectedDraft) {
      setIsEditing(false); // Reset editing state if no draft is selected
      setEditImageBase64(undefined);
      setEditImageMimeType(undefined);
    }
  }, [selectedDraft, isEditing]);

  const handleCreateNewDraft = () => {
    const newDraft = addDraftNote({ title: 'Novo Rascunho', content: '' });
    setSelectedDraft(newDraft);
    setIsEditing(true);
    setEditImageBase64(undefined);
    setEditImageMimeType(undefined);
  };

  const handleSelectDraft = (draft: DraftNote) => {
    if (isEditing && selectedDraft && selectedDraft.id !== draft.id) {
      if (window.confirm("Você tem alterações não salvas no rascunho atual. Deseja descartá-las e abrir outro rascunho?")) {
        setIsEditing(false); 
        setSelectedDraft(draft);
        setEditImageBase64(draft.imageBase64);
        setEditImageMimeType(draft.imageMimeType);
      }
    } else {
        setSelectedDraft(draft);
        setIsEditing(false); 
        setEditImageBase64(draft.imageBase64);
        setEditImageMimeType(draft.imageMimeType);
    }
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit for "low quality"
        toast.error('Imagem muito grande. Máximo 1MB.');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        toast.error('Formato de imagem inválido. Use JPEG, PNG, GIF ou WebP.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImageBase64(reader.result as string);
        setEditImageMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setEditImageBase64(undefined);
    setEditImageMimeType(undefined);
  };

  const handleSaveChanges = () => {
    if (!selectedDraft) return;
    if (!editTitle.trim()) {
      toast.error('O título não pode ficar vazio.');
      return;
    }
    const updatedDraftData: DraftNote = { 
      ...selectedDraft, 
      title: editTitle, 
      content: editContent,
      imageBase64: editImageBase64,
      imageMimeType: editImageMimeType,
    };
    updateDraftNote(updatedDraftData);
    setSelectedDraft(prev => prev ? {...updatedDraftData, updatedAt: new Date().toISOString()} : null);
    setIsEditing(false);
    toast.success('Rascunho salvo!');
  };

  const handleDeleteDraft = (draftId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este rascunho?')) {
      deleteDraftNote(draftId);
      if (selectedDraft?.id === draftId) {
        setSelectedDraft(null);
        setIsEditing(false);
      }
      toast.success('Rascunho excluído.');
    }
  };

  const handleInvokeAI = async () => {
    if (!selectedDraft || !isEditing) return;
    setIsAiLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    const placeholderText = "\n\n[Texto gerado pela IA placeholder... Lorem ipsum dolor sit amet.]";
    setEditContent(prev => prev + placeholderText);
    toast.success("Assistente AI adicionou texto (placeholder).");
    setIsAiLoading(false);
  };


  if (appLoading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }

  return (
    <div className="flex h-full gap-6">
      {/* Sidebar for Draft List */}
      <div className="w-1/3 min-w-[280px] max-w-[350px] bg-card-bg shadow-lg rounded-xl p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-text-primary flex items-center">
            <DraftIcon size={22} className="mr-2 text-accent"/> Meus Rascunhos
          </h2>
          <button
            onClick={handleCreateNewDraft}
            className="p-2 text-accent hover:bg-slate-100 rounded-full"
            title="Criar Novo Rascunho"
          >
            <PlusCircleIcon size={24} />
          </button>
        </div>
        <div className="overflow-y-auto flex-grow space-y-2 pr-1">
          {draftNotes.length === 0 && <p className="text-text-secondary text-sm text-center py-4">Nenhum rascunho ainda.</p>}
          {draftNotes.map(draft => (
            <div
              key={draft.id}
              onClick={() => handleSelectDraft(draft)}
              className={`p-3 rounded-lg cursor-pointer transition-colors
                          ${selectedDraft?.id === draft.id ? 'bg-accent text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200'}`}
            >
              <h3 className={`font-medium truncate ${selectedDraft?.id === draft.id ? 'text-white' : 'text-text-primary'}`}>{draft.title}</h3>
              <p className={`text-xs truncate ${selectedDraft?.id === draft.id ? 'text-blue-100' : 'text-text-secondary'}`}>
                Modificado: {formatDate(draft.updatedAt, {dateStyle: 'short', timeStyle: 'short'})}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-grow bg-card-bg shadow-lg rounded-xl p-6 flex flex-col">
        {selectedDraft ? (
          <>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-border-color">
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-2xl font-semibold text-text-primary bg-transparent border border-border-color rounded-md px-2 py-1 flex-grow mr-4 focus:ring-1 focus:ring-accent outline-none"
                  placeholder="Título do Rascunho"
                />
              ) : (
                <h1 className="text-2xl font-semibold text-text-primary truncate">{selectedDraft.title}</h1>
              )}
              <div className="flex items-center space-x-2">
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-slate-600 hover:text-accent hover:bg-slate-100 rounded-full"
                        title="Editar Rascunho"
                    >
                        <PencilIcon size={20} />
                    </button>
                ) : (
                    <button
                        onClick={handleSaveChanges}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-full"
                        title="Salvar Alterações"
                        disabled={isAiLoading}
                    >
                        <SaveIcon size={20} />
                    </button>
                )}
                 <button
                    onClick={() => handleDeleteDraft(selectedDraft.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full"
                    title="Excluir Rascunho"
                 >
                    <TrashIcon size={20} />
                 </button>
                {isEditing && (
                    <button
                        onClick={() => { setIsEditing(false); setEditTitle(selectedDraft.title); setEditContent(selectedDraft.content); setEditImageBase64(selectedDraft.imageBase64); setEditImageMimeType(selectedDraft.imageMimeType);}}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full"
                        title="Cancelar Edição"
                    >
                        <XIcon size={20} />
                    </button>
                )}
              </div>
            </div>
            
            <div className="text-xs text-text-secondary mb-3">
              Criado: {formatDate(selectedDraft.createdAt, {dateStyle: 'medium', timeStyle: 'short'})} | 
              Última Modificação: {formatDate(selectedDraft.updatedAt, {dateStyle: 'medium', timeStyle: 'short'})}
            </div>

            {/* Image Display/Upload Section */}
            {isEditing ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-secondary mb-1">Imagem (Opcional, máx 1MB)</label>
                {editImageBase64 && editImageMimeType && (
                  <div className="mb-2 relative group">
                    <img src={editImageBase64} alt="Preview do Rascunho" className="max-h-48 w-auto border border-border-color rounded" />
                    <button 
                      onClick={handleRemoveImage} 
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remover Imagem"
                    >
                      <ImageOffIcon size={16} />
                    </button>
                  </div>
                )}
                <div className="flex items-center">
                    <label htmlFor="imageUpload" className="cursor-pointer bg-slate-200 hover:bg-slate-300 text-text-secondary px-3 py-2 rounded-md text-sm flex items-center transition-colors">
                        <ImageUpIcon size={18} className="mr-2"/> {editImageBase64 ? 'Alterar Imagem' : 'Adicionar Imagem'}
                    </label>
                    <input type="file" id="imageUpload" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleImageUpload} className="hidden" />
                </div>
              </div>
            ) : (
              selectedDraft.imageBase64 && selectedDraft.imageMimeType && (
                <div className="mb-4">
                  <img src={selectedDraft.imageBase64} alt="Imagem do Rascunho" className="max-h-60 w-auto border border-border-color rounded" />
                </div>
              )
            )}

            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-grow w-full p-3 border border-border-color rounded-md focus:ring-1 focus:ring-accent outline-none resize-none text-text-primary bg-white text-sm"
                placeholder="Comece a escrever seu rascunho..."
                disabled={isAiLoading}
              />
            ) : (
              <div className="flex-grow w-full p-3 border border-border-color rounded-md overflow-y-auto whitespace-pre-wrap text-text-primary bg-slate-50 text-sm">
                {selectedDraft.content || <span className="text-text-secondary">Este rascunho está vazio.</span>}
              </div>
            )}
            
            {isEditing && (
              <div className="mt-4 pt-4 border-t border-border-color flex justify-end">
                <button
                  onClick={handleInvokeAI}
                  disabled={isAiLoading}
                  className="bg-accent text-white px-4 py-2 rounded-lg shadow hover:brightness-90 transition-all flex items-center disabled:opacity-50"
                >
                  {isAiLoading ? <LoadingSpinner size="sm" color="text-white border-white" /> : <BotIcon size={18} className="mr-2" />}
                  {isAiLoading ? 'Gerando...' : 'Assistente AI'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <DraftIcon size={64} className="text-slate-300 mb-4" />
            <p className="text-xl text-text-secondary">Selecione um rascunho para visualizar ou editar.</p>
            <p className="mt-2 text-text-secondary">Ou crie um novo rascunho para começar.</p>
            <button
                onClick={handleCreateNewDraft}
                className="mt-6 bg-accent text-white px-6 py-3 rounded-lg shadow hover:brightness-90 transition-all flex items-center text-lg"
            >
                <PlusCircleIcon size={22} className="mr-2"/> Criar Novo Rascunho
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DraftsPage;