-- Crea enum per i ruoli
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Crea tabella per i ruoli utente
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Abilita RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Funzione security definer per verificare ruoli (evita problemi RLS ricorsivi)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Funzione per ottenere tutti i ruoli dell'utente
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
RETURNS app_role[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT ARRAY_AGG(role)
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

-- Trigger per assegnare ruolo default
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger su auth.users per assegnare ruolo automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();

-- Policy per user_roles: users possono vedere i propri ruoli, admin tutti
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Aggiorna policies per support_tickets: admin può vedere tutti i ticket
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets or admins can view all" ON public.support_tickets
FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can create their own tickets" ON public.support_tickets;
CREATE POLICY "Users can create tickets" ON public.support_tickets
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tickets" ON public.support_tickets;
CREATE POLICY "Users can update own tickets or admins can update all" ON public.support_tickets
FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Aggiorna policies per support_ticket_replies: admin può vedere tutte le risposte
DROP POLICY IF EXISTS "Users can view replies to their tickets" ON public.support_ticket_replies;
CREATE POLICY "Users can view own ticket replies or admins can view all" ON public.support_ticket_replies
FOR SELECT USING (
  ticket_id IN (
    SELECT id FROM public.support_tickets 
    WHERE user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Users can create replies to their tickets" ON public.support_ticket_replies;
CREATE POLICY "Users can create replies to own tickets or admins to all" ON public.support_ticket_replies
FOR INSERT WITH CHECK (
  (ticket_id IN (
    SELECT id FROM public.support_tickets 
    WHERE user_id = auth.uid()
  ) AND auth.uid() = user_id AND is_staff_reply = false) 
  OR 
  (public.has_role(auth.uid(), 'admin') AND is_staff_reply = true)
);

-- Policy per profiles: admin può vedere tutti i profili
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile or admins can view all" ON public.profiles
FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile or admins can update all" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Assegna ruolo admin all'utente specifico
-- Prima cerca l'utente per email e poi assegna il ruolo
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Trova l'ID dell'utente beppe8949@hotmail.it
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'beppe8949@hotmail.it' 
    LIMIT 1;
    
    -- Se l'utente esiste, assegna il ruolo admin
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Ruolo admin assegnato all''utente %', admin_user_id;
    ELSE
        RAISE NOTICE 'Utente beppe8949@hotmail.it non trovato';
    END IF;
END $$;