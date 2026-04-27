-- Adiciona campos de responsável e status de tarefa à tabela activities
-- assigned_to_id: membro da equipe responsável pela tarefa
-- task_status: status da tarefa (aberto, em_andamento, impedimento, concluido)

ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS assigned_to_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS task_status TEXT DEFAULT 'aberto'
    CHECK (task_status IN ('aberto', 'em_andamento', 'impedimento', 'concluido'));

-- Índices para filtros rápidos
CREATE INDEX IF NOT EXISTS idx_activities_assigned_to ON public.activities (assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_activities_task_status ON public.activities (task_status);
