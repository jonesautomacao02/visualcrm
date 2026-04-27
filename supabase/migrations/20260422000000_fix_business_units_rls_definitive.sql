-- =============================================================================
-- FIX DEFINITIVO: Business Units - Tabela, RLS e Permissões
-- =============================================================================
-- Garante que a tabela existe, cria com IF NOT EXISTS, recria todas as políticas
-- RLS de forma idempotente e concede as permissões necessárias.
-- Execute no SQL Editor do Supabase se as migrations não foram aplicadas via CLI.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PASSO 1: Garantir que a tabela business_units existe
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.business_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  auto_create_deal BOOLEAN NOT NULL DEFAULT false,
  default_board_id UUID REFERENCES public.boards(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Constraint de unicidade (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'business_units_org_key_unique'
  ) THEN
    ALTER TABLE public.business_units
      ADD CONSTRAINT business_units_org_key_unique UNIQUE (organization_id, key);
  END IF;
END $$;

-- Ativar RLS
ALTER TABLE public.business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_units FORCE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_business_units_org    ON public.business_units(organization_id);
CREATE INDEX IF NOT EXISTS idx_business_units_board  ON public.business_units(default_board_id);
CREATE INDEX IF NOT EXISTS idx_business_units_deleted ON public.business_units(organization_id) WHERE deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- PASSO 2: Garantir que a tabela business_unit_members existe
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.business_unit_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id UUID NOT NULL REFERENCES public.business_units(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Constraint de unicidade (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'business_unit_members_unique'
  ) THEN
    ALTER TABLE public.business_unit_members
      ADD CONSTRAINT business_unit_members_unique UNIQUE (business_unit_id, user_id);
  END IF;
END $$;

ALTER TABLE public.business_unit_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_unit_members FORCE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_business_unit_members_unit ON public.business_unit_members(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_business_unit_members_user ON public.business_unit_members(user_id);

-- -----------------------------------------------------------------------------
-- PASSO 3: Garantir que get_user_org_id() existe
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.profiles
  WHERE id = (SELECT auth.uid())
$$;

REVOKE ALL ON FUNCTION public.get_user_org_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_org_id() TO authenticated;

-- -----------------------------------------------------------------------------
-- PASSO 4: Garantir que get_user_is_admin() existe (helper para RLS)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_user_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role = 'admin'
  )
$$;

REVOKE ALL ON FUNCTION public.get_user_is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_is_admin() TO authenticated;

-- -----------------------------------------------------------------------------
-- PASSO 5: Recriar todas as políticas RLS de business_units (idempotente)
-- -----------------------------------------------------------------------------

-- Remover TODAS as políticas antigas (qualquer nome)
DO $$
DECLARE
  pol_name TEXT;
BEGIN
  FOR pol_name IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'business_units' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.business_units', pol_name);
  END LOOP;
END $$;

-- SELECT: qualquer usuário autenticado da mesma org
CREATE POLICY "business_units_select" ON public.business_units
  FOR SELECT TO authenticated
  USING (organization_id = public.get_user_org_id());

-- INSERT: somente admins, e apenas na própria org
CREATE POLICY "business_units_insert" ON public.business_units
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.get_user_org_id()
    AND public.get_user_is_admin()
  );

-- UPDATE: somente admins da própria org
CREATE POLICY "business_units_update" ON public.business_units
  FOR UPDATE TO authenticated
  USING (
    organization_id = public.get_user_org_id()
    AND public.get_user_is_admin()
  )
  WITH CHECK (
    organization_id = public.get_user_org_id()
    AND public.get_user_is_admin()
  );

-- DELETE: somente admins da própria org
CREATE POLICY "business_units_delete" ON public.business_units
  FOR DELETE TO authenticated
  USING (
    organization_id = public.get_user_org_id()
    AND public.get_user_is_admin()
  );

-- -----------------------------------------------------------------------------
-- PASSO 6: Recriar todas as políticas RLS de business_unit_members (idempotente)
-- -----------------------------------------------------------------------------

DO $$
DECLARE
  pol_name TEXT;
BEGIN
  FOR pol_name IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'business_unit_members' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.business_unit_members', pol_name);
  END LOOP;
END $$;

-- SELECT: qualquer usuário autenticado que pertença à mesma org
CREATE POLICY "business_unit_members_select" ON public.business_unit_members
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.business_units bu
      WHERE bu.id = business_unit_members.business_unit_id
        AND bu.organization_id = public.get_user_org_id()
    )
  );

-- INSERT: somente admins
CREATE POLICY "business_unit_members_insert" ON public.business_unit_members
  FOR INSERT TO authenticated
  WITH CHECK (
    public.get_user_is_admin()
    AND EXISTS (
      SELECT 1 FROM public.business_units bu
      WHERE bu.id = business_unit_members.business_unit_id
        AND bu.organization_id = public.get_user_org_id()
    )
  );

-- UPDATE: somente admins
CREATE POLICY "business_unit_members_update" ON public.business_unit_members
  FOR UPDATE TO authenticated
  USING (
    public.get_user_is_admin()
    AND EXISTS (
      SELECT 1 FROM public.business_units bu
      WHERE bu.id = business_unit_members.business_unit_id
        AND bu.organization_id = public.get_user_org_id()
    )
  );

-- DELETE: somente admins
CREATE POLICY "business_unit_members_delete" ON public.business_unit_members
  FOR DELETE TO authenticated
  USING (
    public.get_user_is_admin()
    AND EXISTS (
      SELECT 1 FROM public.business_units bu
      WHERE bu.id = business_unit_members.business_unit_id
        AND bu.organization_id = public.get_user_org_id()
    )
  );

-- -----------------------------------------------------------------------------
-- PASSO 7: Permissões para PostgREST (authenticator + roles)
-- -----------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO authenticator, anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_units TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_unit_members TO authenticated;

GRANT ALL ON public.business_units TO service_role;
GRANT ALL ON public.business_unit_members TO service_role;

-- Sequences (caso existam)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

NOTIFY pgrst, 'reload schema';
