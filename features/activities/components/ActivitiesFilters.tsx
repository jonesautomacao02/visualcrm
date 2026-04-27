import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Activity, ActivityTaskStatus } from '@/types';

interface ActivitiesFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: Activity['type'] | 'ALL';
  setFilterType: (type: Activity['type'] | 'ALL') => void;
  filterTaskStatus: ActivityTaskStatus | 'ALL';
  setFilterTaskStatus: (status: ActivityTaskStatus | 'ALL') => void;
}

/**
 * Componente React `ActivitiesFilters`.
 */
export const ActivitiesFilters: React.FC<ActivitiesFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterTaskStatus,
  setFilterTaskStatus,
}) => {
  return (
    <div className="flex gap-3 mb-6 flex-wrap">
      <div className="flex-1 min-w-[200px] relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Buscar atividades..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <Filter size={18} className="text-slate-400 shrink-0" />
        <select
          className="bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white text-sm"
          value={filterType}
          onChange={e => setFilterType(e.target.value as Activity['type'] | 'ALL')}
        >
          <option value="ALL">Todos os tipos</option>
          <option value="CALL">Ligações</option>
          <option value="MEETING">Reuniões</option>
          <option value="EMAIL">Emails</option>
          <option value="TASK">Tarefas</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <select
          className="bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white text-sm"
          value={filterTaskStatus}
          onChange={e => setFilterTaskStatus(e.target.value as ActivityTaskStatus | 'ALL')}
        >
          <option value="ALL">Todos os status</option>
          <option value="aberto">Aberto</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="impedimento">Impedimento</option>
          <option value="concluido">Concluído</option>
        </select>
      </div>
    </div>
  );
};
