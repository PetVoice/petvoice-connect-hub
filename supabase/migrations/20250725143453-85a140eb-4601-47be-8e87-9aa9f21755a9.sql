-- Crea enum per i ruoli
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Crea tabella user_roles
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Abilita RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Funzione security definer per controllare i ruoli (evita problemi RLS ricorsivi)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Funzione per ottenere tutti i ruoli dell'utente
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS app_role[]
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT ARRAY_AGG(role)
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

-- Policy per user_roles (solo admin possono gestire ruoli)
CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Aggiorna policy support_tickets per admin
DROP POLICY IF EXISTS "Users can manage own tickets" ON public.support_tickets;

CREATE POLICY "Users can manage own tickets" 
ON public.support_tickets 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Policy admin per profiles
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- Crea il primo account admin
-- SOSTITUISCI 'tua-email@example.com' con la tua email reale
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'giusepperos89@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Trigger per auto-assegnare ruolo 'user' ai nuovi utenti
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER assign_default_role_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();