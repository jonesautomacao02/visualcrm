import React from 'react';
import { X } from 'lucide-react';
import { Activity, ActivityTaskStatus } from '@/types';
import { Deal } from '@/types';
import { useOrgMembersQuery } from '@/lib/query/hooks/useOrgMembersQuery';

interface ActivityFormData {
  title: string;
  type: Activity['type'];
  date: string;
  time: string;
  description: string;
  dealId: string;
  assignedToId: string;
  taskStatus: ActivityTaskStatus;
}

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: ActivityFormData;
  setFormData: (data: ActivityFormData) => void;
  editingActivity: Activity | null;
  deals: Deal[];
}

const TASK_STATUS_OPTIONS: { value: ActivityTaskStatus; label: string; color: string }[] = [
  { value: 'aberto',       label: 'Aberto',       color: 'text-slate-500' },
  { value: 'em_andamento', label: 'Em Andamento',  color: 'text-blue-500'  },
  { value: 'impedimento',  label: 'Impedimento',   color: 'text-red-500'   },
  { value: 'concluido',    label: 'Concluído',     color: 'text-green-500' },
];

/**
 * Componente React `ActivityFormModal`.
 */
export const ActivityFormModal: React.FC<ActivityFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingActivity,
  deals,
}) => {
  const { data: members = [] } = useOrgMembersQuery();

  React.useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape, { passive: true });
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 md:left-[var(--app-sidebar-width,0px)] z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 max-h-[calc(100dvh-2rem)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">
            {editingActivity ? 'Editar Atividade' : 'Nova Atividade'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4 overflow-auto pb-[calc(1.25rem+var(--app-safe-area-bottom,0px))]">
          {/* Título */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título</label>
            <input
              required
              type="text"
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: Ligar para Cliente"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Tipo + Negócio */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
              <select
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as Activity['type'] })}
              >
                <option value="CALL">Ligação</option>
                <option value="MEETING">Reunião</option>
                <option value="EMAIL">Email</option>
                <option value="TASK">Tarefa</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Negócio Relacionado
              </label>
              <select
                required={!editingActivity}
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.dealId}
                onChange={e => setFormData({ ...formData, dealId: e.target.value })}
              >
                <option value="">Selecione...</option>
                {deals.map(deal => (
                  <option key={deal.id} value={deal.id}>
                    {deal.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data + Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
              <input
                required
                type="date"
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hora</label>
              <input
                required
                type="time"
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          {/* Responsável + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Responsável
              </label>
              <select
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.assignedToId}
                onChange={e => setFormData({ ...formData, assignedToId: e.target.value })}
              >
                <option value="">Sem responsável</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Status
              </label>
              <select
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.taskStatus}
                onChange={e => setFormData({ ...formData, taskStatus: e.target.value as ActivityTaskStatus })}
              >
                {TASK_STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Descrição
            </label>
            <textarea
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px]"
              placeholder="Detalhes da atividade..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 rounded-lg mt-2 shadow-lg shadow-primary-600/20 transition-all"
          >
            {editingActivity ? 'Salvar Alterações' : 'Criar Atividade'}
          </button>
        </form>
      </div>
    </div>
  );
};
